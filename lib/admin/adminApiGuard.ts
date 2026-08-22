import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { isAdminSessionValueValid } from '@/lib/admin/adminSession';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Refuse an administration request, or return `null` when it carries the session of a signed in administrator
 *
 * Note: The session is a cookie, so a request from another site is refused before the cookie is even looked at
 */
export function getUnauthorizedResponseOrNull(request: NextRequest): NextResponse | null {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse !== null) {
        return crossSiteResponse;
    }

    const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    return isAdminSessionValueValid(sessionValue)
        ? null
        : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
