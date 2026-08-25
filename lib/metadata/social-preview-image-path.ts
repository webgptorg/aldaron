import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH } from '@/lib/metadata/site-config';

/**
 * Resolves the sharing preview image of a page from the same definition that
 * supplies its title, canonical URL, and Open Graph metadata.
 *
 * A page with its own `opengraph-image` route keeps that image next to its
 * route. Pages without one deliberately share the stable site-wide card.
 */
export function resolveSocialPreviewImagePath(definition: PageMetadataDefinition): string {
    if (definition.socialPreviewImagePath) {
        return definition.socialPreviewImagePath;
    }

    if (!definition.isSocialPreviewImageGenerated) {
        return DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH;
    }

    return `${definition.path.replace(/\/$/, '')}${DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH}`;
}
