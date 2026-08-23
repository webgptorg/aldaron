import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'correct-horse-battery-staple';
const ADMIN_API_URL = 'https://promptbook.studio/api/admin/workshops';

function createAdminApiRequest(headers: Readonly<Record<string, string>> = {}): NextRequest {
    return new NextRequest(ADMIN_API_URL, { headers });
}

describe('the guard of the administration API', () => {
    beforeEach(() => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    });

    afterEach(() => {
        if (ORIGINAL_ADMIN_PASSWORD === undefined) {
            delete process.env.ADMIN_PASSWORD;
        } else {
            process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
        }
    });

    it('lets a request of a signed in administrator through', () => {
        const request = createAdminApiRequest({ cookie: createAdminSessionCookieHeader() });

        expect(getUnauthorizedResponseOrNull(request)).toBeNull();
    });

    it('refuses a request without a session before it reaches the database', () => {
        expect(getUnauthorizedResponseOrNull(createAdminApiRequest())?.status).toBe(401);
    });

    it('refuses a made up session', () => {
        const request = createAdminApiRequest({ cookie: `${ADMIN_SESSION_COOKIE_NAME}=made-up-session` });

        expect(getUnauthorizedResponseOrNull(request)?.status).toBe(401);
    });

    it('no longer opens the administration by a token written into the address', () => {
        const request = new NextRequest(`${ADMIN_API_URL}?token=${ADMIN_PASSWORD}`);

        expect(getUnauthorizedResponseOrNull(request)?.status).toBe(401);
    });

    it('refuses a request which another site sends with the session of the administrator', () => {
        const request = createAdminApiRequest({
            cookie: createAdminSessionCookieHeader(),
            origin: 'https://example.com',
        });

        expect(getUnauthorizedResponseOrNull(request)?.status).toBe(403);
    });
});
