import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { GET, POST } from './route';

const ORIGINAL_ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_TOKEN = 'discount-code-admin-token';
const DISCOUNT_CODE_ROW = {
    id: '6b6863db-3fa1-4da0-85b2-0e55a33d1af0',
    code: 'WEBINAR_2026_09_04',
    percent: 25,
    starts_at: '2026-09-04T00:00:00.000Z',
    ends_at: '2026-09-04T23:59:59.000Z',
    is_enabled: true,
    is_online_workshop_follow_up: false,
    created_at: '2026-08-21T00:00:00.000Z',
    updated_at: '2026-08-21T00:00:00.000Z',
};

function createAdminDiscountCodesRequest(
    method: 'GET' | 'POST',
    token: string | null,
    body?: Readonly<Record<string, unknown>>,
): NextRequest {
    const baseUrl = 'https://promptbook.studio/api/admin/ai-supervize-mini/discount-codes';
    const url = token === null ? baseUrl : `${baseUrl}?token=${encodeURIComponent(token)}`;

    return new NextRequest(url, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function restoreAdminToken(): void {
    if (ORIGINAL_ADMIN_TOKEN === undefined) {
        delete process.env.ADMIN_TOKEN;
    } else {
        process.env.ADMIN_TOKEN = ORIGINAL_ADMIN_TOKEN;
    }
}

describe('AI Supervize Mini discount-code admin collection', () => {
    beforeEach(() => {
        process.env.ADMIN_TOKEN = ADMIN_TOKEN;
        createSupabaseServiceRoleClientMock.mockReset();
    });

    afterEach(() => {
        restoreAdminToken();
    });

    it('refuses an unauthenticated request before it reaches the discount database', async () => {
        const response = await GET(createAdminDiscountCodesRequest('GET', null));

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('lists the complete private discount-code configuration for an administrator', async () => {
        const orderByCreation = vi.fn().mockResolvedValue({ data: [DISCOUNT_CODE_ROW], error: null });
        const orderByStart = vi.fn(() => ({ order: orderByCreation }));
        const select = vi.fn(() => ({ order: orderByStart }));
        const from = vi.fn(() => ({ select }));
        createSupabaseServiceRoleClientMock.mockReturnValue({ from });

        const response = await GET(createAdminDiscountCodesRequest('GET', ADMIN_TOKEN));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            discountCodes: [
                {
                    id: DISCOUNT_CODE_ROW.id,
                    code: 'WEBINAR_2026_09_04',
                    percent: 25,
                    startsAt: DISCOUNT_CODE_ROW.starts_at,
                    endsAt: DISCOUNT_CODE_ROW.ends_at,
                    isEnabled: true,
                    isOnlineWorkshopFollowUp: false,
                    createdAt: DISCOUNT_CODE_ROW.created_at,
                    updatedAt: DISCOUNT_CODE_ROW.updated_at,
                },
            ],
        });
    });

    it('normalizes and stores an administrator-created discount code through the service role', async () => {
        const single = vi.fn().mockResolvedValue({ data: DISCOUNT_CODE_ROW, error: null });
        const select = vi.fn(() => ({ single }));
        const insert = vi.fn(() => ({ select }));
        const from = vi.fn(() => ({ insert }));
        createSupabaseServiceRoleClientMock.mockReturnValue({ from });

        const response = await POST(
            createAdminDiscountCodesRequest('POST', ADMIN_TOKEN, {
                code: ' webinar-2026-09-04 ',
                percent: 25,
                startsAt: '2026-09-04T00:00:00+02:00',
                endsAt: '2026-09-04T23:59:59+02:00',
                isEnabled: true,
                isOnlineWorkshopFollowUp: false,
            }),
        );

        expect(response.status).toBe(201);
        expect(from).toHaveBeenCalledWith('ai_supervize_mini_discount_codes');
        expect(insert).toHaveBeenCalledWith({
            code: 'WEBINAR_2026_09_04',
            percent: 25,
            starts_at: '2026-09-04T00:00:00+02:00',
            ends_at: '2026-09-04T23:59:59+02:00',
            is_enabled: true,
            is_online_workshop_follow_up: false,
        });
    });

    it('reports a duplicate code as an actionable conflict', async () => {
        const single = vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key value violates unique constraint' },
        });
        const select = vi.fn(() => ({ single }));
        const insert = vi.fn(() => ({ select }));
        const from = vi.fn(() => ({ insert }));
        createSupabaseServiceRoleClientMock.mockReturnValue({ from });

        const response = await POST(
            createAdminDiscountCodesRequest('POST', ADMIN_TOKEN, {
                code: 'webinar-2026-09-04',
                percent: 25,
                startsAt: '2026-09-04T00:00:00+02:00',
                endsAt: '2026-09-04T23:59:59+02:00',
                isEnabled: true,
                isOnlineWorkshopFollowUp: false,
            }),
        );

        expect(response.status).toBe(409);
        expect(await response.json()).toEqual({ error: 'Slevový kód již existuje.' });
    });
});
