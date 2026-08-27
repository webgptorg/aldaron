import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { GET } from './route';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'shortener-admin-token';
const SHORTCODE_LINK_ID = 42;

const SHORTCODE_LINK_CLICK_ROW = {
    id: 7,
    shortcodeLinkId: SHORTCODE_LINK_ID,
    navigatedAt: '2026-08-25T10:00:00.000Z',
    clickedAt: '2026-08-25T10:01:00.000Z',
    ip: '203.0.113.42',
    userAgent: 'Example browser',
    referer: 'https://example.com/newsletter',
    language: 'cs-CZ',
    platform: 'Windows',
};

function createShortcodeLinkClickListDatabase(rows: readonly unknown[]) {
    const range = vi.fn().mockResolvedValue({ data: rows, error: null });
    const orderById = vi.fn(() => ({ range }));
    const orderByNavigation = vi.fn(() => ({ order: orderById }));
    const notMissingNavigation = vi.fn(() => ({ order: orderByNavigation }));
    const equals = vi.fn(() => ({ not: notMissingNavigation }));
    const select = vi.fn(() => ({ eq: equals }));
    const from = vi.fn(() => ({ select }));

    return { from, range, equals, notMissingNavigation };
}

function createShortcodeLinkClickRequest(isAdminSignedIn: boolean, shortcodeLinkId: string): NextRequest {
    return new NextRequest(`https://promptbook.studio/api/admin/shortener/${shortcodeLinkId}/clicks`, {
        headers: isAdminSignedIn ? { cookie: createAdminSessionCookieHeader() } : {},
    });
}

function createShortcodeLinkClickRouteContext(shortcodeLinkId: string) {
    return { params: Promise.resolve({ shortcodeLinkId }) };
}

function restoreAdminToken(): void {
    if (ORIGINAL_ADMIN_PASSWORD === undefined) {
        delete process.env.ADMIN_PASSWORD;
    } else {
        process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
    }
}

describe('admin shortcode link clicks', () => {
    beforeEach(() => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
        createSupabaseServiceRoleClientMock.mockReset();
    });

    afterEach(() => {
        restoreAdminToken();
    });

    it('refuses a click history without the session of an administrator before reaching the database', async () => {
        const response = await GET(
            createShortcodeLinkClickRequest(false, String(SHORTCODE_LINK_ID)),
            createShortcodeLinkClickRouteContext(String(SHORTCODE_LINK_ID)),
        );

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('does not query clicks for an invalid short-link identifier', async () => {
        const response = await GET(
            createShortcodeLinkClickRequest(true, 'not-an-id'),
            createShortcodeLinkClickRouteContext('not-an-id'),
        );

        expect(response.status).toBe(404);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('lists every recorded navigation of one short link for an administrator', async () => {
        const database = createShortcodeLinkClickListDatabase([SHORTCODE_LINK_CLICK_ROW]);
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await GET(
            createShortcodeLinkClickRequest(true, String(SHORTCODE_LINK_ID)),
            createShortcodeLinkClickRouteContext(String(SHORTCODE_LINK_ID)),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ shortcodeLinkClicks: [SHORTCODE_LINK_CLICK_ROW] });
        expect(database.from).toHaveBeenCalledWith('ShortcodeLinkClick');
        expect(database.equals).toHaveBeenCalledWith('shortcodeLinkId', SHORTCODE_LINK_ID);
        expect(database.notMissingNavigation).toHaveBeenCalledWith('navigatedAt', 'is', null);
        expect(database.range).toHaveBeenCalledWith(0, 999);
    });
});
