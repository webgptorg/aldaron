const WORKSHOP_UTM_SOURCE = 'promptbook';
const WORKSHOP_UTM_MEDIUM = 'workshop';
const WORKSHOP_MATERIAL_HASH_LINK_PREFIX = '#';
const WORKSHOP_MATERIAL_ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

function getWorkshopMaterialLinkBaseUrl(): string {
    return typeof window === 'undefined' ? 'https://www.promptbook.studio' : window.location.origin;
}

/**
 * Keeps material links usable while making their workshop origin visible to
 * the destination's analytics. Unsupported protocols and in-page anchors are
 * intentionally left untouched.
 */
export function createWorkshopMaterialTrackingUrl(
    destinationUrl: string,
    workshopSlug: string,
    contentBlockId: string,
): string {
    if (!destinationUrl || destinationUrl.startsWith(WORKSHOP_MATERIAL_HASH_LINK_PREFIX)) {
        return destinationUrl;
    }

    try {
        const parsedUrl = new URL(destinationUrl, getWorkshopMaterialLinkBaseUrl());
        if (!WORKSHOP_MATERIAL_ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
            return destinationUrl;
        }

        parsedUrl.searchParams.set('utm_source', WORKSHOP_UTM_SOURCE);
        parsedUrl.searchParams.set('utm_medium', WORKSHOP_UTM_MEDIUM);
        parsedUrl.searchParams.set('utm_campaign', workshopSlug);
        parsedUrl.searchParams.set('utm_content', contentBlockId);
        return parsedUrl.toString();
    } catch {
        return destinationUrl;
    }
}
