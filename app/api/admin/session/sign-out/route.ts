import { ADMIN_DASHBOARD_PATH, ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { buildAdminLoginPath } from '@/lib/admin/adminLoginRedirect';
import { getExpiredAdminSessionCookieOptions } from '@/lib/admin/adminSession';
import { redirectAfterAdminForm } from '@/lib/admin/redirectAfterAdminForm';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { NextRequest } from 'next/server';

/**
 * Ends the session of the administration and offers the login again
 */
export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse !== null) {
        return crossSiteResponse;
    }

    const response = redirectAfterAdminForm(request, buildAdminLoginPath(ADMIN_DASHBOARD_PATH));
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', getExpiredAdminSessionCookieOptions());

    return response;
}
