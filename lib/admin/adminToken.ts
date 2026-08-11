/**
 * Name of the url query parameter which carries the admin token
 *
 * Note: Every `/admin` page reads the token from this parameter and passes it to the api it talks to, so the whole
 *       administration is reachable by one link and never asks for a password.
 */
export const ADMIN_TOKEN_PARAMETER_NAME = 'token';

/**
 * Whether the given token is the one admin token of the site
 *
 * Note: It reads a server only environment variable, so in the browser it always answers `false` - the browser is
 *       never the place where the access is decided.
 */
export function isAdminTokenValid(token: string | null): boolean {
    const expectedAdminToken = process.env.ADMIN_TOKEN;

    if (!expectedAdminToken) {
        return false;
    }

    return token === expectedAdminToken;
}
