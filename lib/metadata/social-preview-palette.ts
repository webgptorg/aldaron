/**
 * Colors of every layer of a social preview image
 */
export type SocialPreviewPalette = {
    readonly backgroundStart: string;
    readonly backgroundEnd: string;
    readonly accent: string;
    readonly accentSoft: string;
    readonly frame: string;
    readonly cardBackground: string;
    readonly mutedText: string;
    readonly chipBackground: string;
    readonly chipBorder: string;
    readonly sidePanelBackground: string;
    readonly sidePanelBorder: string;
    readonly sideLabel: string;
    readonly statBackground: string;
    readonly statBorder: string;
    readonly orbPrimary: string;
    readonly orbSecondary: string;
};

/**
 * Four colors a page has to pick to get a complete, on-brand social preview palette
 */
export type SocialPreviewPaletteSeed = {
    /**
     * Top left color of the background gradient
     */
    readonly backgroundStart: string;

    /**
     * Bottom right color of the background gradient
     */
    readonly backgroundEnd: string;

    /**
     * Highlight color of the eyebrow, chips and orbs
     */
    readonly accent: string;

    /**
     * Secondary highlight color the accent gradients fade into
     */
    readonly accentSoft: string;
};

/**
 * Turns a hexadecimal color into a translucent `rgba()` color
 *
 * @param hexColor color in the `#rgb` or `#rrggbb` notation
 * @param alpha opacity between `0` and `1`
 */
function createTranslucentColor(hexColor: string, alpha: number): string {
    const normalizedHexColor = hexColor.replace('#', '');
    const expandedHexColor =
        normalizedHexColor.length === 3
            ? normalizedHexColor
                  .split('')
                  .map((character) => character + character)
                  .join('')
            : normalizedHexColor;

    const red = parseInt(expandedHexColor.slice(0, 2), 16);
    const green = parseInt(expandedHexColor.slice(2, 4), 16);
    const blue = parseInt(expandedHexColor.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Derives the full social preview palette from the few colors a page picks
 *
 * Note: Every page used to spell out all sixteen colors, which made palettes drift apart; deriving them keeps every
 *       sharing preview recognizably the same design with a page specific accent.
 *
 * @param seed colors specific to the page
 * @returns palette consumed by the social preview image renderer
 */
export function createSocialPreviewPalette(seed: SocialPreviewPaletteSeed): SocialPreviewPalette {
    return {
        ...seed,
        frame: 'rgba(255, 255, 255, 0.12)',
        cardBackground: createTranslucentColor(seed.backgroundStart, 0.82),
        mutedText: 'rgba(255, 255, 255, 0.78)',
        chipBackground: 'rgba(255, 255, 255, 0.08)',
        chipBorder: createTranslucentColor(seed.accent, 0.28),
        sidePanelBackground: `linear-gradient(180deg, ${createTranslucentColor(
            seed.accent,
            0.18,
        )} 0%, rgba(255, 255, 255, 0.06) 100%)`,
        sidePanelBorder: createTranslucentColor(seed.accent, 0.24),
        sideLabel: 'rgba(255, 255, 255, 0.72)',
        statBackground: 'rgba(255, 255, 255, 0.06)',
        statBorder: 'rgba(255, 255, 255, 0.08)',
        orbPrimary: createTranslucentColor(seed.accent, 0.18),
        orbSecondary: createTranslucentColor(seed.accentSoft, 0.14),
    };
}
