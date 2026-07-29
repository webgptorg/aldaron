import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import {
    DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH,
    OPEN_GRAPH_LOCALE_BY_LANGUAGE,
    SITE_NAME,
    SITE_TWITTER_HANDLE,
    createAbsoluteUrl,
} from '@/lib/metadata/site-config';
import type { Metadata } from 'next';

/**
 * Width of a sharing preview image in pixels, matching the 1.91:1 ratio expected by Facebook, LinkedIn and X
 */
const SOCIAL_PREVIEW_IMAGE_WIDTH = 1200;

/**
 * Height of a sharing preview image in pixels
 */
const SOCIAL_PREVIEW_IMAGE_HEIGHT = 630;

/**
 * Robots directives applied to pages which must stay out of search results
 */
const HIDDEN_FROM_SEARCH_ROBOTS: NonNullable<Metadata['robots']> = {
    index: false,
    follow: false,
    googleBot: {
        index: false,
        follow: false,
    },
};

/**
 * Resolves the path of the sharing preview image of a page
 */
function resolveSocialPreviewImagePath(definition: PageMetadataDefinition): string {
    if (definition.socialPreviewImagePath) {
        return definition.socialPreviewImagePath;
    }

    if (!definition.isSocialPreviewImageGenerated) {
        return DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH;
    }

    return `${definition.path.replace(/\/$/, '')}${DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH}`;
}

/**
 * Resolves the `hreflang` alternates of a page, including the `x-default` fallback
 */
function resolveLanguageAlternates(definition: PageMetadataDefinition): Record<string, string> | undefined {
    if (!definition.languageAlternates) {
        return undefined;
    }

    const languageAlternates: Record<string, string> = { ...definition.languageAlternates };
    const defaultLanguageAlternate = definition.languageAlternates.en ?? definition.languageAlternates.cs;

    if (defaultLanguageAlternate) {
        languageAlternates['x-default'] = defaultLanguageAlternate;
    }

    return languageAlternates;
}

/**
 * Builds the complete Next.js `Metadata` of a page from its definition
 *
 * Note: Open Graph images are always set explicitly, because Next.js replaces the whole inherited `openGraph` object
 *       as soon as a page exports one of its own - a page without explicit images would end up with no preview image.
 *
 * @param definition single source of truth describing the page
 * @returns metadata ready to be exported from a page or layout
 */
export function createPageMetadata(definition: PageMetadataDefinition): Metadata {
    const socialTitle = definition.socialTitle ?? definition.title;
    const socialDescription = definition.socialDescription ?? definition.description;
    const socialPreviewImageAlt = definition.socialPreviewImageAlt ?? socialTitle;
    const socialPreviewImagePath = resolveSocialPreviewImagePath(definition);
    const isIndexed = definition.isIndexed ?? true;

    const socialPreviewImage = {
        url: socialPreviewImagePath,
        width: SOCIAL_PREVIEW_IMAGE_WIDTH,
        height: SOCIAL_PREVIEW_IMAGE_HEIGHT,
        alt: socialPreviewImageAlt,
    };

    return {
        title: definition.title,
        description: definition.description,
        ...(definition.keywords ? { keywords: [...definition.keywords] } : {}),
        alternates: {
            canonical: definition.path,
            languages: resolveLanguageAlternates(definition),
        },
        openGraph: {
            type: definition.openGraphType ?? 'website',
            siteName: SITE_NAME,
            locale: OPEN_GRAPH_LOCALE_BY_LANGUAGE[definition.language],
            title: socialTitle,
            description: socialDescription,
            url: createAbsoluteUrl(definition.path),
            images: [socialPreviewImage],
        },
        twitter: {
            card: 'summary_large_image',
            site: SITE_TWITTER_HANDLE,
            creator: SITE_TWITTER_HANDLE,
            title: socialTitle,
            description: socialDescription,
            images: [socialPreviewImage],
        },
        ...(isIndexed ? {} : { robots: HIDDEN_FROM_SEARCH_ROBOTS }),
    };
}
