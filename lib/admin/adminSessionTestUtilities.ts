import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';

/**
 * The `Cookie` header of a browser in which an administrator is signed in
 *
 * Note: Only the tests build such a header themselves, a browser of an administrator receives it from the login
 */
export function createAdminSessionCookieHeader(): string {
    return `${ADMIN_SESSION_COOKIE_NAME}=${createAdminSessionValueOrNull()}`;
}
