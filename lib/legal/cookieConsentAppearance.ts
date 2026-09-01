import { AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';

/**
 * Visual language the shared cookie consent surface uses on a page.
 *
 * Most pages deliberately share the neutral Promptbook treatment. The podcast is an independent product with its
 * own colours, so it is the one page family that needs a different appearance without owning a second banner.
 */
export type CookieConsentAppearance = 'default' | 'podcast';

/**
 * Chooses the visual language of the cookie consent surface from the page being read.
 *
 * @param pathname current browser pathname, or `null` while the router is not ready
 */
export function getCookieConsentAppearance(pathname: string | null): CookieConsentAppearance {
    const isPodcastPage =
        pathname === AI_TA_KRAJTA_PATH || pathname?.startsWith(`${AI_TA_KRAJTA_PATH}/`) === true;

    return isPodcastPage ? 'podcast' : 'default';
}
