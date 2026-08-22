import {
    ADMIN_DASHBOARD_PATH,
    ADMIN_INVALID_CREDENTIALS_ERROR,
    ADMIN_LOGIN_ERROR_QUERY_PARAMETER,
    ADMIN_LOGIN_PATH,
    ADMIN_REDIRECT_PATH_QUERY_PARAMETER,
} from '@/lib/admin/adminConstants';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';

/**
 * Whether the administration can be sent to the given path after a sign in
 *
 * Note: Only a path inside the administration is followed, so a link into the login page can never send anybody
 *       somewhere else, and the login page itself is left out so that a sign in does not lead back to it
 */
function isAdminRedirectPathAllowed(redirectPath: string | null): redirectPath is string {
    if (redirectPath === null) {
        return false;
    }

    const isInsideAdministration =
        redirectPath === ADMIN_DASHBOARD_PATH || redirectPath.startsWith(`${ADMIN_DASHBOARD_PATH}/`);
    const isLoginPage = redirectPath === ADMIN_LOGIN_PATH || redirectPath.startsWith(`${ADMIN_LOGIN_PATH}?`);

    return isInsideAdministration && !isLoginPage;
}

/**
 * The page which is opened once the sign in succeeds, which is the dashboard whenever no other page asked for it
 */
export function getAdminRedirectPath(requestedRedirectPath: SearchParameterValue): string {
    const redirectPath = readFirstSearchParameter(requestedRedirectPath);

    return isAdminRedirectPathAllowed(redirectPath) ? redirectPath : ADMIN_DASHBOARD_PATH;
}

/**
 * Address of the login page which returns to the given page of the administration once the credentials are accepted
 *
 * Note: A refused sign in leads back to the very same page, which then says that the credentials were not accepted
 */
export function buildAdminLoginPath(redirectPath: string, isSignInRefused = false): string {
    return appendSearchParameters(ADMIN_LOGIN_PATH, {
        [ADMIN_REDIRECT_PATH_QUERY_PARAMETER]: redirectPath,
        [ADMIN_LOGIN_ERROR_QUERY_PARAMETER]: isSignInRefused ? ADMIN_INVALID_CREDENTIALS_ERROR : undefined,
    });
}

/**
 * Whether the login page was opened after the credentials had been refused
 */
export function isAdminSignInRefused(loginError: SearchParameterValue): boolean {
    return readFirstSearchParameter(loginError) === ADMIN_INVALID_CREDENTIALS_ERROR;
}
