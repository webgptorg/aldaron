import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { POST } from './route';

const ORIGINAL_ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_TOKEN = 'shortener-admin-token';

type ShortcodeLinkDatabase = {
    readonly from: ReturnType<typeof vi.fn>;
    readonly insert: ReturnType<typeof vi.fn>;
};

function createShortcodeLinkDatabase(error: { readonly code?: string; readonly message: string } | null): ShortcodeLinkDatabase {
    const insert = vi.fn().mockResolvedValue({ error });
    const from = vi.fn(() => ({ insert }));

    return { from, insert };
}

function createShortcodeLinkRequest(
    token: string | null,
    body: Readonly<Record<string, unknown>>,
): NextRequest {
    const url = token === null
        ? 'https://promptbook.studio/api/admin/shortener'
        : 'https://promptbook.studio/api/admin/shortener?token=' + encodeURIComponent(token);

    return new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

function restoreAdminToken(): void {
    if (ORIGINAL_ADMIN_TOKEN === undefined) {
        delete process.env.ADMIN_TOKEN;
    } else {
        process.env.ADMIN_TOKEN = ORIGINAL_ADMIN_TOKEN;
    }
}

describe('admin shortcode creation', () => {
    beforeEach(() => {
        process.env.ADMIN_TOKEN = ADMIN_TOKEN;
        createSupabaseServiceRoleClientMock.mockReset();
    });

    afterEach(() => {
        restoreAdminToken();
    });

    it('refuses a request without the admin token before reaching the database', async () => {
        const response = await POST(
            createShortcodeLinkRequest(null, { shortcode: 'public-code', urls: ['https://example.com'] }),
        );

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('writes a validated shortcode only through the server service role', async () => {
        const database = createShortcodeLinkDatabase(null);
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(
            createShortcodeLinkRequest(ADMIN_TOKEN, {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/offer'],
            }),
        );

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ shortcode: 'campaign-abc123' });
        expect(database.from).toHaveBeenCalledWith('ShortcodeLink');
        expect(database.insert).toHaveBeenCalledWith({
            type: 'CUSTOM',
            shortcode: 'campaign-abc123',
            url: ['https://example.com/offer'],
            ownerEmail: null,
        });
    });

    it('does not reach the database for an invalid short link request', async () => {
        const response = await POST(
            createShortcodeLinkRequest(ADMIN_TOKEN, { shortcode: 'not/a-code', urls: ['not a URL'] }),
        );

        expect(response.status).toBe(400);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('reports an unavailable service-role database instead of falling back to the public client', async () => {
        createSupabaseServiceRoleClientMock.mockReturnValue(null);

        const response = await POST(
            createShortcodeLinkRequest(ADMIN_TOKEN, {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/offer'],
            }),
        );

        expect(response.status).toBe(503);
    });

    it('allows an administrator to choose another preview when the shortcode already exists', async () => {
        const database = createShortcodeLinkDatabase({ code: '23505', message: 'duplicate key value' });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(
            createShortcodeLinkRequest(ADMIN_TOKEN, {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/offer'],
            }),
        );

        expect(response.status).toBe(409);
        expect(await response.json()).toEqual({ error: 'This shortcode is already in use' });
    });
});
