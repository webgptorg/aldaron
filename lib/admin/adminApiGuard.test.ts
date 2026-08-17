import { getUnauthorizedResponseOrNull, isAdminTokenValid } from '@/lib/admin/adminApiGuard';
import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

const ORIGINAL_ADMIN_TOKEN = process.env.ADMIN_TOKEN;

afterEach(() => {
    if (ORIGINAL_ADMIN_TOKEN === undefined) {
        delete process.env.ADMIN_TOKEN;
    } else {
        process.env.ADMIN_TOKEN = ORIGINAL_ADMIN_TOKEN;
    }
});

describe('shared admin token guard', () => {
    it('accepts only the configured token', () => {
        process.env.ADMIN_TOKEN = 'correct-horse-battery-staple';

        expect(isAdminTokenValid('correct-horse-battery-staple')).toBe(true);
        expect(isAdminTokenValid('wrong-token')).toBe(false);
        expect(isAdminTokenValid(null)).toBe(false);
    });

    it('stays closed when the server has no token configured', () => {
        delete process.env.ADMIN_TOKEN;

        expect(isAdminTokenValid('any-value')).toBe(false);
    });

    it('returns an unauthorized response before an admin API reaches the database', () => {
        process.env.ADMIN_TOKEN = 'expected-token';
        const request = new NextRequest('https://promptbook.studio/api/admin/workshops?token=incorrect-token');

        expect(getUnauthorizedResponseOrNull(request)?.status).toBe(401);
    });
});
