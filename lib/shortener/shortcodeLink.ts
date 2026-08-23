import { SHORTCODE_LINK_PUBLIC_BASE_URL } from '@/lib/shortener/shortcodeLinkConstants';

/**
 * Everything an administrator decides about one short link
 *
 * Note: Creating and editing write exactly these values, which is what keeps one validation and one database mapping
 *       enough for both.
 */
export type ShortcodeLinkValues = {
    /**
     * The part of the public address which follows {@link SHORTCODE_LINK_PUBLIC_BASE_URL}
     */
    readonly shortcode: string;

    /**
     * Where the short link leads; a visitor of a link with more than one destination reaches a random one of them
     */
    readonly urls: readonly string[];

    /**
     * A private remark of the administration, which no visitor ever sees
     */
    readonly note: string | null;

    /**
     * Markdown or HTML shown instead of redirecting straight away, or `null` for a plain redirect
     */
    readonly landingPage: string | null;
};

/**
 * One short link as it is stored, which is its values together with what only the database decides
 */
export type ShortcodeLink = ShortcodeLinkValues & {
    readonly id: number;
    readonly createdAt: string;
};

/**
 * The address which is handed out for a shortcode
 */
export function createPublicShortcodeLinkUrl(shortcode: string): string {
    return SHORTCODE_LINK_PUBLIC_BASE_URL + shortcode;
}

/**
 * Whether a short link greets its visitor with a page of its own instead of redirecting them straight away
 */
export function hasShortcodeLinkLandingPage(shortcodeLink: ShortcodeLink): boolean {
    return shortcodeLink.landingPage !== null;
}
