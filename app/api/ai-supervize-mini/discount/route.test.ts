import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadActiveDiscountMock } = vi.hoisted(() => ({
    loadActiveDiscountMock: vi.fn(),
}));

vi.mock('@/businesses/ai-supervize-mini/discountCodeDatabase', () => ({
    loadAiSupervizeMiniActiveDiscount: loadActiveDiscountMock,
}));

import { POST } from './route';

function createDiscountValidationRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/ai-supervize-mini/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('AI Supervize Mini discount validation endpoint', () => {
    beforeEach(() => {
        loadActiveDiscountMock.mockReset();
    });

    it('returns the one active discount for a submitted code without exposing a list', async () => {
        loadActiveDiscountMock.mockResolvedValue({
            activeDiscount: { code: 'WEBINAR_2026_09_04', percent: 25 },
            errorMessage: null,
        });

        const response = await POST(createDiscountValidationRequest({ discountCode: 'webinar-2026-09-04' }));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            activeDiscount: { code: 'WEBINAR_2026_09_04', percent: 25 },
        });
        expect(loadActiveDiscountMock).toHaveBeenCalledWith('webinar-2026-09-04');
    });

    it('rejects malformed requests before querying the database', async () => {
        const response = await POST(createDiscountValidationRequest({ discountCode: 25 }));

        expect(response.status).toBe(400);
        expect(loadActiveDiscountMock).not.toHaveBeenCalled();
    });

    it('fails closed when the configured discount cannot be checked', async () => {
        loadActiveDiscountMock.mockResolvedValue({ activeDiscount: null, errorMessage: 'Database not configured' });

        const response = await POST(createDiscountValidationRequest({ discountCode: 'WEBINAR' }));

        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.' });
    });
});
