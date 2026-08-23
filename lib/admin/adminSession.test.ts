import { ADMIN_SESSION_MAX_AGE_SECONDS, ADMIN_USERNAME } from '@/lib/admin/adminConstants';
import { isAdminSignInAllowed, isAdminTokenValid } from '@/lib/admin/adminCredentials';
import { getAdminRedirectPath, isAdminSignInRefused } from '@/lib/admin/adminLoginRedirect';
import { createAdminSessionValueOrNull, isAdminSessionValueValid } from '@/lib/admin/adminSession';
import { afterEach, describe, expect, it } from 'vitest';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'correct-horse-battery-staple';
const ADMIN_SESSION_MAX_AGE_MILLISECONDS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

afterEach(() => {
    if (ORIGINAL_ADMIN_PASSWORD === undefined) {
        delete process.env.ADMIN_PASSWORD;
    } else {
        process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
    }
});

describe('the credentials of the administration', () => {
    it('accepts only the administrator named with the admin token of the server', () => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;

        expect(isAdminSignInAllowed(ADMIN_USERNAME, ADMIN_PASSWORD)).toBe(true);
        expect(isAdminSignInAllowed(ADMIN_USERNAME, 'another-token')).toBe(false);
        expect(isAdminSignInAllowed('somebody-else', ADMIN_PASSWORD)).toBe(false);
        expect(isAdminSignInAllowed(null, null)).toBe(false);
    });

    it('stays closed when the server has no admin token configured', () => {
        delete process.env.ADMIN_PASSWORD;

        expect(isAdminTokenValid('any-value')).toBe(false);
        expect(isAdminSignInAllowed(ADMIN_USERNAME, 'any-value')).toBe(false);
        expect(createAdminSessionValueOrNull()).toBeNull();
    });
});

describe('the session of the administration', () => {
    it('keeps a signed in administrator signed in', () => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;

        expect(isAdminSessionValueValid(createAdminSessionValueOrNull())).toBe(true);
    });

    it('never carries the admin token itself', () => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;

        expect(createAdminSessionValueOrNull()).not.toContain(ADMIN_PASSWORD);
    });

    it('ends the session once it is older than the configured maximum age', () => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
        const signedInAtMilliseconds = Date.now() - ADMIN_SESSION_MAX_AGE_MILLISECONDS - 1000;
        const sessionValue = createAdminSessionValueOrNull(signedInAtMilliseconds);

        expect(isAdminSessionValueValid(sessionValue)).toBe(false);
    });

    it('refuses a session which was not signed by the admin token of this server', () => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
        const sessionValueOfAnotherServer = createAdminSessionValueOrNull();

        process.env.ADMIN_PASSWORD = 'another-admin-token';

        expect(isAdminSessionValueValid(sessionValueOfAnotherServer)).toBe(false);
    });

    it('refuses a made up session, however it is written', () => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;

        expect(isAdminSessionValueValid(null)).toBe(false);
        expect(isAdminSessionValueValid('')).toBe(false);
        expect(isAdminSessionValueValid('made-up')).toBe(false);
        expect(isAdminSessionValueValid(`${Date.now()}.made-up-signature`)).toBe(false);
        expect(isAdminSessionValueValid(`not-a-moment.${'0'.repeat(64)}`)).toBe(false);
        // Note: A session which starts in the future would outlive the maximum age of a session
        expect(isAdminSessionValueValid(createAdminSessionValueOrNull(Date.now() + 60 * 1000))).toBe(false);
    });
});

describe('where the administration goes after a sign in', () => {
    it('follows only a page of the administration itself', () => {
        expect(getAdminRedirectPath('/admin/workshops?workshop=production-code')).toBe(
            '/admin/workshops?workshop=production-code',
        );
        expect(getAdminRedirectPath('/admin')).toBe('/admin');
        expect(getAdminRedirectPath(['/admin/contacts', '/admin/shortener'])).toBe('/admin/contacts');
        expect(getAdminRedirectPath('https://example.com/admin')).toBe('/admin');
        expect(getAdminRedirectPath('//example.com')).toBe('/admin');
        expect(getAdminRedirectPath('/cs/online-workshop')).toBe('/admin');
        expect(getAdminRedirectPath(undefined)).toBe('/admin');
    });

    it('never sends a signed in administrator back to the login page', () => {
        expect(getAdminRedirectPath('/admin/login')).toBe('/admin');
        expect(getAdminRedirectPath('/admin/login?redirectPath=/admin/contacts')).toBe('/admin');
    });

    it('says whether the previous credentials were refused', () => {
        expect(isAdminSignInRefused('invalid-credentials')).toBe(true);
        expect(isAdminSignInRefused(undefined)).toBe(false);
        expect(isAdminSignInRefused('something-else')).toBe(false);
    });
});
