const SUPPORTED_COMMUNITY_PROJECT_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Canonicalizes a project URL before it reaches a scraper or the database. Fragments name a browser position rather
 * than a project itself, so they are deliberately left out of the shared address.
 */
export function normalizeCommunityProjectUrl(value: string): string | null {
    try {
        const parsedUrl = new URL(value.trim());
        if (
            !SUPPORTED_COMMUNITY_PROJECT_PROTOCOLS.has(parsedUrl.protocol) ||
            parsedUrl.username !== '' ||
            parsedUrl.password !== ''
        ) {
            return null;
        }

        parsedUrl.hash = '';
        return parsedUrl.toString();
    } catch {
        return null;
    }
}

export function isCommunityProjectUrl(value: string): boolean {
    return normalizeCommunityProjectUrl(value) !== null;
}
