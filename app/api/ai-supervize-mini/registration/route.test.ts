import { AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    createContactsUnreachableResponseMock,
    getContactsTableOrNullMock,
    insertContactMock,
    consumeDiscountCodeMock,
    loadWorkshopAvailabilityMock,
} = vi.hoisted(() => ({
    createContactsUnreachableResponseMock: vi.fn(),
    getContactsTableOrNullMock: vi.fn(),
    insertContactMock: vi.fn(),
    consumeDiscountCodeMock: vi.fn(),
    loadWorkshopAvailabilityMock: vi.fn(),
}));

vi.mock('@/lib/contacts/contactsDatabase', () => ({
    createContactsUnreachableResponse: createContactsUnreachableResponseMock,
    getContactsTableOrNull: getContactsTableOrNullMock,
    insertContact: insertContactMock,
}));

vi.mock('@/businesses/ai-supervize-mini/workshopRegistrationDatabase', () => ({
    loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable: loadWorkshopAvailabilityMock,
}));

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    consumeDiscountCode: consumeDiscountCodeMock,
}));

import { POST } from './route';

const CONTACTS_TABLE = {};
const WORKSHOP_AVAILABILITIES = [
    { workshopDateId: '2026-09-04', registeredParticipantCount: 2, remainingSeatCount: 8 },
    { workshopDateId: '2026-09-09', registeredParticipantCount: 4, remainingSeatCount: 46 },
] as const;

function createRegistrationRequest(overrides: Readonly<Record<string, unknown>> = {}): NextRequest {
    return new NextRequest('http://localhost/api/ai-supervize-mini/registration', {
        method: 'POST',
        body: JSON.stringify({
            selectedDateId: '2026-09-04',
            participantCount: 2,
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            company: 'Firma s.r.o.',
            invoiceType: 'company',
            billingDetails: 'Firma s.r.o., IČO 12345678',
            userNote: 'Chceme probrat code review.',
            discountCode: 'webinar-2026-08-20',
            ...overrides,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('AI Supervize Mini registration endpoint', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-20T12:00:00+02:00'));
        createContactsUnreachableResponseMock.mockReset();
        getContactsTableOrNullMock.mockReset();
        insertContactMock.mockReset();
        consumeDiscountCodeMock.mockReset();
        loadWorkshopAvailabilityMock.mockReset();
        getContactsTableOrNullMock.mockReturnValue(CONTACTS_TABLE);
        loadWorkshopAvailabilityMock.mockResolvedValue({
            workshopAvailabilities: WORKSHOP_AVAILABILITIES,
            errorMessage: null,
        });
        insertContactMock.mockResolvedValue({ contact: { id: 1 }, errorMessage: null });
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'applied',
            activeDiscount: { code: 'WEBINAR_2026_08_20', percent: 25, remainingUseCount: 4 },
            errorMessage: null,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('stores a server-calculated registration and its webinar discount in a contact', async () => {
        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as {
            workshopAvailabilities: typeof WORKSHOP_AVAILABILITIES;
            workshopPrice: { basePriceCzk: number; discountAmountCzk: number; finalPriceCzk: number };
        };

        expect(response.status).toBe(200);
        expect(loadWorkshopAvailabilityMock).toHaveBeenCalledWith(CONTACTS_TABLE);
        expect(consumeDiscountCodeMock).toHaveBeenCalledWith('webinar-2026-08-20', AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID);
        expect(insertContactMock).toHaveBeenCalledTimes(1);
        expect(responseBody.workshopPrice).toEqual({
            basePriceCzk: 24000,
            discountAmountCzk: 6000,
            finalPriceCzk: 18000,
        });
        expect(responseBody.workshopAvailabilities).toContainEqual({
            workshopDateId: '2026-09-04',
            registeredParticipantCount: 4,
            remainingSeatCount: 6,
        });

        const storedContact = insertContactMock.mock.calls[0]![1] as { readonly userNote: string };
        const storedRegistration = JSON.parse(storedContact.userNote) as Record<string, unknown>;

        expect(storedContact).toMatchObject({
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            placeName: 'AiSupervizeMiniWorkshopRegistration',
        });
        expect(storedRegistration).toMatchObject({
            selectedDateId: '2026-09-04',
            participantCount: 2,
            discountCodeUsed: 'WEBINAR_2026_08_20',
            discountPercentApplied: 25,
            unitPriceCzk: 12000,
            computedFinalPriceCzk: 18000,
            isVatPayer: false,
        });
    });

    it('refuses a registration which no longer fits into the current contact-based capacity', async () => {
        const response = await POST(createRegistrationRequest({ participantCount: 9 }));
        const responseBody = (await response.json()) as { error: string; workshopAvailabilities: unknown };

        expect(response.status).toBe(409);
        expect(responseBody.error).toBe('V tomto termínu zbývá už jen 8 míst.');
        expect(responseBody.workshopAvailabilities).toEqual(WORKSHOP_AVAILABILITIES);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('refuses a registration whose discount code ran out between the preview and the submission', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'exhausted', activeDiscount: null, errorMessage: null });

        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as { error: string };

        expect(response.status).toBe(409);
        expect(responseBody.error).toBe(
            'Slevový kód byl mezitím vyčerpán. Zkontrolujte prosím cenu a odešlete registraci znovu.',
        );
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('stores a registration at the full price when the submitted code is not usable at all', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'unusable', activeDiscount: null, errorMessage: null });

        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as {
            workshopPrice: { basePriceCzk: number; discountAmountCzk: number; finalPriceCzk: number };
        };

        expect(response.status).toBe(200);
        expect(responseBody.workshopPrice).toEqual({
            basePriceCzk: 24000,
            discountAmountCzk: 0,
            finalPriceCzk: 24000,
        });
    });

    it('does not store a registration when its submitted discount cannot be verified', async () => {
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'unusable',
            activeDiscount: null,
            errorMessage: 'Database not configured',
        });

        const response = await POST(createRegistrationRequest());

        expect(response.status).toBe(503);
        expect(insertContactMock).not.toHaveBeenCalled();
    });
});
