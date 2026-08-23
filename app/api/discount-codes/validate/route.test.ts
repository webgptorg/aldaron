import { AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadActiveDiscountMock } = vi.hoisted(() => ({
    loadActiveDiscountMock: vi.fn(),
}));

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    loadActiveDiscount: loadActiveDiscountMock,
}));

import { POST } from './route';

const ACTIVE_DISCOUNT = { code: 'WEBINAR_2026_09_04', percent: 25, remainingUseCount: 3 };

function createDiscountValidationRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('discount validation endpoint', () => {
    beforeEach(() => {
        loadActiveDiscountMock.mockReset();
    });

    it('returns the one active discount for a submitted code without exposing a list', async () => {
        loadActiveDiscountMock.mockResolvedValue({ activeDiscount: ACTIVE_DISCOUNT, errorMessage: null });

        const response = await POST(
            createDiscountValidationRequest({
                discountCode: 'webinar-2026-09-04',
                discountPlaceId: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
            }),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ activeDiscount: ACTIVE_DISCOUNT });
        expect(loadActiveDiscountMock).toHaveBeenCalledWith(
            'webinar-2026-09-04',
            AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
        );
    });

    it('rejects malformed requests before querying the database', async () => {
        const response = await POST(
            createDiscountValidationRequest({
                discountCode: 25,
                discountPlaceId: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
            }),
        );

        expect(response.status).toBe(400);
        expect(loadActiveDiscountMock).not.toHaveBeenCalled();
    });

    it('rejects a place the application does not offer', async () => {
        const response = await POST(
            createDiscountValidationRequest({ discountCode: 'WEBINAR', discountPlaceId: 'nowhere' }),
        );

        expect(response.status).toBe(400);
        expect(loadActiveDiscountMock).not.toHaveBeenCalled();
    });

    it('fails closed when the configured discount cannot be checked', async () => {
        loadActiveDiscountMock.mockResolvedValue({ activeDiscount: null, errorMessage: 'Database not configured' });

        const response = await POST(
            createDiscountValidationRequest({
                discountCode: 'WEBINAR',
                discountPlaceId: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
            }),
        );

        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.' });
    });
});
