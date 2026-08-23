import { ADMIN_SESSION_COOKIE_NAME, ADMIN_USERNAME } from '@/lib/admin/adminConstants';
import { isAdminSessionValueValid } from '@/lib/admin/adminSession';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST } from './route';
import { POST as SIGN_OUT } from './sign-out/route';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'correct-horse-battery-staple';
const ADMIN_SESSION_API_URL = 'https://promptbook.studio/api/admin/session';

function createSignInRequest(
    formFields: Readonly<Record<string, string>>,
    requestUrl: string = ADMIN_SESSION_API_URL,
    additionalHeaders: Readonly<Record<string, string>> = {},
): NextRequest {
    const formData = new URLSearchParams(formFields);

    return new NextRequest(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...additionalHeaders },
        body: formData.toString(),
    });
}

function readSessionCookieValue(response: NextResponse): string | undefined {
    return response.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
}

describe('signing in to the administration', () => {
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

    it('opens a session and returns to the page which was asked for', async () => {
        const response = await POST(
            createSignInRequest({
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD,
                redirectPath: '/admin/contacts',
            }),
        );

        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('/admin/contacts');
        expect(isAdminSessionValueValid(readSessionCookieValue(response))).toBe(true);
    });

    it('opens a session for a same-origin form which reaches Next.js through a proxy', async () => {
        const response = await POST(
            createSignInRequest(
                { username: ADMIN_USERNAME, password: ADMIN_PASSWORD, redirectPath: '/admin' },
                'http://localhost:4009/api/admin/session',
                { origin: 'https://ptbk.io', 'sec-fetch-site': 'same-origin' },
            ),
        );

        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('/admin');
        expect(isAdminSessionValueValid(readSessionCookieValue(response))).toBe(true);
    });

    it('never answers with the admin token itself', async () => {
        const response = await POST(
            createSignInRequest({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, redirectPath: '/admin' }),
        );

        expect(response.headers.get('set-cookie')).not.toContain(ADMIN_PASSWORD);
        expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    });

    it('opens no session for wrong credentials and says so on the login page', async () => {
        const response = await POST(
            createSignInRequest({ username: ADMIN_USERNAME, password: 'wrong-token', redirectPath: '/admin/contacts' }),
        );

        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe(
            '/admin/login?redirectPath=%2Fadmin%2Fcontacts&error=invalid-credentials',
        );
        expect(readSessionCookieValue(response)).toBeUndefined();
    });

    it('opens no session for another name than the one administrator', async () => {
        const response = await POST(
            createSignInRequest({ username: 'somebody-else', password: ADMIN_PASSWORD, redirectPath: '/admin' }),
        );

        expect(readSessionCookieValue(response)).toBeUndefined();
    });

    it('refuses a login form sent from another site', async () => {
        const request = new NextRequest(ADMIN_SESSION_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', origin: 'https://example.com' },
            body: new URLSearchParams({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }).toString(),
        });

        expect((await POST(request)).status).toBe(403);
    });

    it('ends the session again and offers the login', async () => {
        const response = await SIGN_OUT(new NextRequest(`${ADMIN_SESSION_API_URL}/sign-out`, { method: 'POST' }));

        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('/admin/login?redirectPath=%2Fadmin');
        expect(readSessionCookieValue(response)).toBe('');
    });
});
