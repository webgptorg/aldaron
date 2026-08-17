import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';

const THIRD_PARTY_TRACKING_EXCLUDED_PATH_PREFIXES = ['/admin', ONLINE_WORKSHOP_PARTICIPANT_PATH] as const;
const SENSITIVE_TRACKING_QUERY_PARAMETERS = ['email', 'fullname', 'token'] as const;

/**
 * Admin URLs carry a bearer token and the participant URL can carry personal
 * data. Neither page may be sent to analytics or session-recording services.
 */
export function isThirdPartyTrackingAllowed(pathname: string): boolean {
    return !THIRD_PARTY_TRACKING_EXCLUDED_PATH_PREFIXES.some(
        (excludedPrefix) => pathname === excludedPrefix || pathname.startsWith(`${excludedPrefix}/`),
    );
}

/**
 * Defense in depth for any URL recorded before a page-level exclusion takes
 * effect, including same-origin API calls.
 */
export function removeSensitiveTrackingParameters(url: string): string {
    try {
        const parsedUrl = new URL(
            url,
            typeof window === 'undefined' ? 'https://www.promptbook.studio' : window.location.origin,
        );
        SENSITIVE_TRACKING_QUERY_PARAMETERS.forEach((parameterName) => parsedUrl.searchParams.delete(parameterName));
        return parsedUrl.toString();
    } catch {
        return url;
    }
}
