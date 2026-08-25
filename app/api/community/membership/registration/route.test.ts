import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    createContactsUnreachableResponseMock,
    consumeDiscountCodeMock,
    getContactsTableOrNullMock,
    insertContactMock,
} = vi.hoisted(() => ({
    createContactsUnreachableResponseMock: vi.fn(),
    consumeDiscountCodeMock: vi.fn(),
    getContactsTableOrNullMock: vi.fn(),
    insertContactMock: vi.fn(),
}));

vi.mock('@/lib/contacts/contactsDatabase', () => ({
    createContactsUnreachableResponse: createContactsUnreachableResponseMock,
    getContactsTableOrNull: getContactsTableOrNullMock,
    insertContact: insertContactMock,
}));

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    consumeDiscountCode: consumeDiscountCodeMock,
}));

import { POST } from './route';

const CONTACTS_TABLE = {};

function createMembershipRegistrationRequest(overrides: Readonly<Record<string, unknown>> = {}): NextRequest {
    return new NextRequest('http://localhost/api/community/membership/registration', {
        method: 'POST',
        body: JSON.stringify({
            planId: 'premium',
            billingCycle: 'yearly',
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            discountCode: 'komunita25',
            ...overrides,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('community membership registration endpoint', () => {
    beforeEach(() => {
        createContactsUnreachableResponseMock.mockReset();
        consumeDiscountCodeMock.mockReset();
        getContactsTableOrNullMock.mockReset();
        insertContactMock.mockReset();
        getContactsTableOrNullMock.mockReturnValue(CONTACTS_TABLE);
        insertContactMock.mockResolvedValue({ contact: { id: 1 }, errorMessage: null });
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'applied',
            activeDiscount: { code: 'KOMUNITA25', percent: 25, remainingUseCount: null },
            errorMessage: null,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('stores the server-calculated annual quote with both discounts', async () => {
        const response = await POST(createMembershipRegistrationRequest());
        const responseBody = (await response.json()) as {
            readonly membershipPrice: Record<string, unknown>;
            readonly planName: string;
            readonly trialDays: number;
        };

        expect(response.status).toBe(200);
        expect(consumeDiscountCodeMock).toHaveBeenCalledWith('komunita25', 'community-premium');
        expect(responseBody).toMatchObject({ planName: 'Premium', trialDays: 7 });
        expect(responseBody.membershipPrice).toEqual({
            basePriceCzk: 1800,
            annualDiscountAmountCzk: 360,
            priceAfterAnnualDiscountCzk: 1440,
            discountCodePercent: 25,
            discountCodeAmountCzk: 360,
            finalPriceCzk: 1080,
        });

        expect(insertContactMock).toHaveBeenCalledWith(
            CONTACTS_TABLE,
            expect.objectContaining({
                fullname: 'Jana Nováková',
                email: 'jana@example.com',
                placeName: 'CommunityMembershipRegistration',
            }),
        );
        const storedContact = insertContactMock.mock.calls[0]![1] as { readonly userNote: string };
        expect(JSON.parse(storedContact.userNote)).toMatchObject({
            registrationType: 'COMMUNITY_MEMBERSHIP_REGISTRATION',
            planId: 'premium',
            billingCycle: 'yearly',
            trialDays: 7,
            discountCodeUsed: 'KOMUNITA25',
            computedFinalPriceCzk: 1080,
        });
    });

    it('refuses Free because it does not have a paid membership registration', async () => {
        const response = await POST(createMembershipRegistrationRequest({ planId: 'free' }));

        expect(response.status).toBe(400);
        expect(consumeDiscountCodeMock).not.toHaveBeenCalled();
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('does not create a membership application after the last code use is gone', async () => {
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'exhausted',
            activeDiscount: null,
            errorMessage: null,
        });

        const response = await POST(createMembershipRegistrationRequest());
        const responseBody = (await response.json()) as { readonly error: string };

        expect(response.status).toBe(409);
        expect(responseBody.error).toContain('vyčerpán');
        expect(insertContactMock).not.toHaveBeenCalled();
    });
});
