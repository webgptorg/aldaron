import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { DELETE, PATCH } from './route';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'discount-code-admin-token';
const DISCOUNT_CODE_ID = '6b6863db-3fa1-4da0-85b2-0e55a33d1af0';
const DISCOUNT_CODE_ROW = {
    id: DISCOUNT_CODE_ID,
    code: 'WEBINAR_2026_09_04',
    percent: 25,
    starts_at: '2026-09-04T00:00:00.000Z',
    ends_at: '2026-09-04T23:59:59.000Z',
    is_enabled: true,
    is_online_workshop_follow_up: true,
    created_at: '2026-08-21T00:00:00.000Z',
    updated_at: '2026-08-21T00:00:00.000Z',
};

function createDiscountCodeRouteContext(discountCodeId: string = DISCOUNT_CODE_ID) {
    return { params: Promise.resolve({ discountCodeId }) };
}

function createDiscountCodeRequest(
    method: 'PATCH' | 'DELETE',
    isAdminSignedIn: boolean,
    body?: Readonly<Record<string, unknown>>,
): NextRequest {
    const url = `https://promptbook.studio/api/admin/ai-supervize-mini/discount-codes/${DISCOUNT_CODE_ID}`;
    const headers: Record<string, string> = isAdminSignedIn ? { cookie: createAdminSessionCookieHeader() } : {};
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    return new NextRequest(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function createDiscountCodeValues() {
    return {
        code: 'webinar-2026-09-04',
        percent: 25,
        startsAt: '2026-09-04T00:00:00+02:00',
        endsAt: '2026-09-04T23:59:59+02:00',
        isEnabled: true,
        isOnlineWorkshopFollowUp: true,
    };
}

function restoreAdminToken(): void {
    if (ORIGINAL_ADMIN_PASSWORD === undefined) {
        delete process.env.ADMIN_PASSWORD;
    } else {
        process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
    }
}

describe('AI Supervize Mini discount-code admin item', () => {
    beforeEach(() => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
        createSupabaseServiceRoleClientMock.mockReset();
    });

    afterEach(() => {
        restoreAdminToken();
    });

    it('updates exactly the requested code through the service-role database', async () => {
        const maybeSingle = vi.fn().mockResolvedValue({ data: DISCOUNT_CODE_ROW, error: null });
        const select = vi.fn(() => ({ maybeSingle }));
        const equal = vi.fn(() => ({ select }));
        const update = vi.fn(() => ({ eq: equal }));
        const from = vi.fn(() => ({ update }));
        createSupabaseServiceRoleClientMock.mockReturnValue({ from });

        const response = await PATCH(
            createDiscountCodeRequest('PATCH', true, createDiscountCodeValues()),
            createDiscountCodeRouteContext(),
        );

        expect(response.status).toBe(200);
        expect(equal).toHaveBeenCalledWith('id', DISCOUNT_CODE_ID);
        expect(update).toHaveBeenCalledWith({
            code: 'WEBINAR_2026_09_04',
            percent: 25,
            starts_at: '2026-09-04T00:00:00+02:00',
            ends_at: '2026-09-04T23:59:59+02:00',
            is_enabled: true,
            is_online_workshop_follow_up: true,
        });
    });

    it('deletes exactly the requested code and refuses an invalid route id', async () => {
        const maybeSingle = vi.fn().mockResolvedValue({ data: { id: DISCOUNT_CODE_ID }, error: null });
        const select = vi.fn(() => ({ maybeSingle }));
        const equal = vi.fn(() => ({ select }));
        const remove = vi.fn(() => ({ eq: equal }));
        const from = vi.fn(() => ({ delete: remove }));
        createSupabaseServiceRoleClientMock.mockReturnValue({ from });

        const deleteResponse = await DELETE(
            createDiscountCodeRequest('DELETE', true),
            createDiscountCodeRouteContext(),
        );

        expect(deleteResponse.status).toBe(200);
        expect(equal).toHaveBeenCalledWith('id', DISCOUNT_CODE_ID);

        const invalidIdResponse = await DELETE(
            createDiscountCodeRequest('DELETE', true),
            createDiscountCodeRouteContext('not-a-uuid'),
        );

        expect(invalidIdResponse.status).toBe(404);
    });
});
