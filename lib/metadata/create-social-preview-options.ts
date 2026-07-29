import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { SITE_NAME, SITE_URL } from '@/lib/metadata/site-config';
import type { SocialPreviewImageOptions, SocialPreviewStat } from '@/lib/metadata/social-preview-image';
import { createSocialPreviewPalette, type SocialPreviewPaletteSeed } from '@/lib/metadata/social-preview-palette';

/**
 * Page specific part of a sharing preview image
 *
 * Note: The headline, the description and the url are intentionally missing here - they are taken from the page
 *       definition so that a sharing preview can never drift away from what the page actually claims.
 */
export type SocialPreviewContent = {
    /**
     * Small uppercase line above the headline
     */
    readonly eyebrow: string;

    /**
     * Audience the page is written for
     */
    readonly audienceLabel: string;

    /**
     * Short selling points rendered as chips
     */
    readonly bullets: readonly string[];

    /**
     * Facts highlighted in the side panel
     */
    readonly stats: readonly SocialPreviewStat[];

    /**
     * Main call to action of the page
     */
    readonly callToActionLabel: string;

    /**
     * Colors specific to the page
     */
    readonly paletteSeed: SocialPreviewPaletteSeed;

    /**
     * Brand shown next to the logo dot, defaults to the site name
     */
    readonly brandLabel?: string;
};

/**
 * Turns an absolute site url into the short label shown on a sharing preview, for example `ptbk.io/pro-mesta`
 */
function createUrlLabel(path: string): string {
    const host = SITE_URL.replace(/^https?:\/\//, '');

    return `${host}${path === '/' ? '' : path}`;
}

/**
 * Combines a page definition with its page specific artwork into complete sharing preview image options
 *
 * @param definition single source of truth describing the page
 * @param content page specific part of the sharing preview
 */
export function createSocialPreviewOptions(
    definition: PageMetadataDefinition,
    content: SocialPreviewContent,
): SocialPreviewImageOptions {
    const socialTitle = definition.socialTitle ?? definition.title;

    return {
        alt: definition.socialPreviewImageAlt ?? socialTitle,
        brandLabel: content.brandLabel ?? SITE_NAME,
        eyebrow: content.eyebrow,
        title: socialTitle,
        description: definition.socialDescription ?? definition.description,
        bullets: content.bullets,
        urlLabel: createUrlLabel(definition.path),
        audienceLabel: content.audienceLabel,
        stats: content.stats,
        callToActionLabel: content.callToActionLabel,
        palette: createSocialPreviewPalette(content.paletteSeed),
    };
}
