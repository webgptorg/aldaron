import {
    ADMIN_PASSWORD_FIELD_NAME,
    ADMIN_REDIRECT_PATH_FIELD_NAME,
    ADMIN_SESSION_COOKIE_NAME,
    ADMIN_USERNAME_FIELD_NAME,
} from '@/lib/admin/adminConstants';
import { isAdminSignInAllowed } from '@/lib/admin/adminCredentials';
import { buildAdminLoginPath, getAdminRedirectPath } from '@/lib/admin/adminLoginRedirect';
import { createAdminSessionValueOrNull, getAdminSessionCookieOptions } from '@/lib/admin/adminSession';
import { redirectAfterAdminForm } from '@/lib/admin/redirectAfterAdminForm';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { NextRequest } from 'next/server';

function readFormFieldOrNull(formData: FormData, fieldName: string): string | null {
    const fieldValue = formData.get(fieldName);

    return typeof fieldValue === 'string' ? fieldValue : null;
}

/**
 * Opens the session of the administration for the one administrator whose password is the admin token of this server
 *
 * Note: The credentials are sent in a form and answered by a redirect, so that they never end up in an address which a
 *       browser would keep in its history or repeat on a reload
 */
export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse !== null) {
        return crossSiteResponse;
    }

    const formData = await request.formData();
    const username = readFormFieldOrNull(formData, ADMIN_USERNAME_FIELD_NAME);
    const password = readFormFieldOrNull(formData, ADMIN_PASSWORD_FIELD_NAME);
    const redirectPath = getAdminRedirectPath(
        readFormFieldOrNull(formData, ADMIN_REDIRECT_PATH_FIELD_NAME) ?? undefined,
    );

    const sessionValue = isAdminSignInAllowed(username, password) ? createAdminSessionValueOrNull() : null;
    if (sessionValue === null) {
        return redirectAfterAdminForm(request, buildAdminLoginPath(redirectPath, true));
    }

    const response = redirectAfterAdminForm(request, redirectPath);
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionValue, getAdminSessionCookieOptions());

    return response;
}
