/**
 * Utility functions for handling landing page behavior based on URL parameters
 */

export type LandingBehavior = 'direct' | 'popup';

/**
 * Determines the landing behavior based on URL search parameters
 * @param searchParams - URL search parameters (URLSearchParams object or null)
 * @returns 'direct' for direct navigation, 'popup' for showing the platform selection popup
 */
export function getLandingBehavior(searchParams: URLSearchParams | null): LandingBehavior {
    if (!searchParams) {
        return 'direct';
    }

    const fromParam = searchParams.get('from');

    // If from=social, show popup for platform selection
    if (fromParam === 'social') {
        return 'popup';
    }

    // If from=social-links or from is not set, go directly
    return 'direct';
}

/**
 * Gets the appropriate redirect URL based on the landing behavior
 * @param behavior - The determined landing behavior
 * @param selectedPlatforms - Array of selected platform names (for popup behavior)
 * @param deepScrapingMode - Whether deep scraping is enabled (for popup behavior)
 * @returns The URL to redirect to
 */
export function getRedirectUrl(
    behavior: LandingBehavior,
    selectedPlatforms: string[] = [],
    deepScrapingMode: boolean = false
): string {
    if (behavior === 'direct') {
        return 'https://promptbook.studio/from-social-links';
    }

    // For popup behavior, construct URL with services and scraping mode
    const serviceParams = selectedPlatforms.map(platform => platform.toLowerCase()).join(',');
    const scrapingMode = deepScrapingMode ? 'DEEP' : 'QUICK';
    return `https://promptbook.studio/from-social?services=${serviceParams}&scrapingMode=${scrapingMode}`;
}
