import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_TOKEN_QUERY_PARAMETER } from '@/lib/admin/adminConstants';
import { NextRequest, NextResponse } from 'next/server';

function hashAdminToken(token: string): Buffer {
    return createHash('sha256').update(token, 'utf8').digest();
}

/**
 * Compare an incoming admin token without leaking useful timing information.
 */
export function isAdminTokenValid(token: string | null | undefined): boolean {
    const expectedToken = process.env.ADMIN_TOKEN;

    if (!expectedToken || !token) {
        return false;
    }

    return timingSafeEqual(hashAdminToken(token), hashAdminToken(expectedToken));
}

/**
 * Refuse an admin API request, or return `null` when its URL carries the shared admin token.
 */
export function getUnauthorizedResponseOrNull(request: NextRequest): NextResponse | null {
    const token = request.nextUrl.searchParams.get(ADMIN_TOKEN_QUERY_PARAMETER);

    return isAdminTokenValid(token) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
