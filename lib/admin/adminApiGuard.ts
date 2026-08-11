import { ADMIN_TOKEN_PARAMETER_NAME, isAdminTokenValid } from '@/lib/admin/adminToken';
import { NextResponse } from 'next/server';

/**
 * Refusal of a request which does not carry the admin token, or `null` when the request may continue
 *
 * Note: Every administration endpoint starts with this one guard, so the rule who may write is written down once.
 */
export function getUnauthorizedResponseOrNull(request: Request): NextResponse | null {
    const token = new URL(request.url).searchParams.get(ADMIN_TOKEN_PARAMETER_NAME);

    if (isAdminTokenValid(token)) {
        return null;
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
