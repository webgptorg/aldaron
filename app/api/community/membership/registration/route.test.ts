import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({ consumeDiscountCode: consumeDiscountCodeMock }));

import { POST } from './route';

const CONTACTS_TABLE = {};

function createMembershipRequest(overrides: Readonly<Record<string, unknown>> = {}): NextRequest {
    return new NextRequest('http://localhost/api/community/membership/registration', {
        method: 'POST',
        body: JSON.stringify({
            planId: 'premium',
            billingCycle: 'yearly',
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            discountCode: 'komunita25',
            termsAccepted: true,
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

    it('stores a server-calculated Premium quote and its locked base price', async () => {
        const response = await POST(createMembershipRequest());
        const responseBody = (await response.json()) as Record<string, unknown>;

        expect(response.status).toBe(200);
        expect(consumeDiscountCodeMock).toHaveBeenCalledWith('komunita25', 'community-premium');
        expect(responseBody).toMatchObject({
            planId: 'premium',
            planName: 'Premium',
            billingCycle: 'yearly',
            trialDays: 7,
        });
        expect(responseBody.membershipPrice).toEqual({
            basePriceCzk: 12000,
            annualDiscountAmountCzk: 2400,
            priceAfterAnnualDiscountCzk: 9600,
            discountCodePercent: 25,
            discountCodeAmountCzk: 2400,
            finalPriceCzk: 7200,
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
            termsVersion: '2026-08-26',
            lockedMonthlyPriceCzk: 1000,
            discountCodeUsed: 'KOMUNITA25',
            computedFinalPriceCzk: 7200,
        });
    });

    it('accepts Standard without a code and does not invent a discount', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'unusable', activeDiscount: null, errorMessage: null });

        const response = await POST(
            createMembershipRequest({ planId: 'standard', billingCycle: 'monthly', discountCode: '' }),
        );
        const responseBody = (await response.json()) as { readonly membershipPrice: Record<string, unknown> };

        expect(response.status).toBe(200);
        expect(responseBody.membershipPrice).toMatchObject({ finalPriceCzk: 150, discountCodePercent: 0 });
    });

    it('refuses Basic and a request which did not accept the terms', async () => {
        const basicResponse = await POST(createMembershipRequest({ planId: 'basic' }));
        const termsResponse = await POST(createMembershipRequest({ termsAccepted: false }));

        expect(basicResponse.status).toBe(400);
        expect(termsResponse.status).toBe(400);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('refuses an oversized discount-code input before reaching the database', async () => {
        const response = await POST(createMembershipRequest({ discountCode: 'x'.repeat(201) }));

        expect(response.status).toBe(400);
        expect(consumeDiscountCodeMock).not.toHaveBeenCalled();
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('does not silently discard an entered inactive or exhausted code', async () => {
        consumeDiscountCodeMock.mockResolvedValueOnce({ status: 'unusable', activeDiscount: null, errorMessage: null });
        const inactiveResponse = await POST(createMembershipRequest());

        consumeDiscountCodeMock.mockResolvedValueOnce({
            status: 'exhausted',
            activeDiscount: null,
            errorMessage: null,
        });
        const exhaustedResponse = await POST(createMembershipRequest());

        expect(inactiveResponse.status).toBe(409);
        expect(exhaustedResponse.status).toBe(409);
        expect(insertContactMock).not.toHaveBeenCalled();
    });
});
