import {
    AI_TA_KRAJTA_MARK_BODY_SLICES,
    AI_TA_KRAJTA_MARK_BOUNDS,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import {
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS,
    AI_TA_KRAJTA_NAME,
} from '@/businesses/ai-ta-krajta/config';

/**
 * Shape of the tile the snake sits on
 *
 * `rounded` is for a browser tab and a bookmark, which draw an icon exactly as it is. Such an icon rounds itself and
 * leaves its corners transparent.
 *
 * `square` is for a home screen and an installed application, which round an icon themselves and draw a transparent
 * pixel of it black. Such an icon has to reach into its own corners.
 */
export type AiTaKrajtaIconTileShape = 'rounded' | 'square';

/**
 * How round a rounded tile is, as a share of its edge
 *
 * Note: Measured off the cover artwork of the show, so that the browser tab and the cover round the same.
 */
const TILE_CORNER_RADIUS_RATIO = 0.211;

/**
 * How far the mark is moved to put the animal, rather than its view box, in the middle of the tile
 */
const MARK_HORIZONTAL_OFFSET =
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE / 2 - (AI_TA_KRAJTA_MARK_BOUNDS.left + AI_TA_KRAJTA_MARK_BOUNDS.right) / 2;
const MARK_VERTICAL_OFFSET =
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE / 2 - (AI_TA_KRAJTA_MARK_BOUNDS.top + AI_TA_KRAJTA_MARK_BOUNDS.bottom) / 2;

/**
 * The icon of the podcast, as a standalone SVG document
 *
 * Note: It draws the very same snake the page draws, so the browser tab can never fall behind the logo above it. The
 *       cover artwork of the show is a JPEG, which has no transparency and therefore paints the corners around its
 *       rounding white. This drawing rounds the tile itself instead, so nothing is left in the corners.
 *
 * @param tileShape whether the tile rounds its own corners or is rounded by the platform showing it
 */
export function createAiTaKrajtaIconSvg(tileShape: AiTaKrajtaIconTileShape): string {
    const viewBoxSize = AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE;
    const cornerRadius = tileShape === 'rounded' ? viewBoxSize * TILE_CORNER_RADIUS_RATIO : 0;
    const markMarkup = AI_TA_KRAJTA_MARK_BODY_SLICES.map(
        (slice) =>
            `<path d="${slice.pathData}" stroke="${slice.color}" stroke-width="${slice.strokeWidth}"` +
            ` stroke-linecap="${AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP}" fill="none"/>`,
    ).join('');

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"` +
        ` width="${AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS}" height="${AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS}"` +
        ` fill="none" role="img" aria-label="${AI_TA_KRAJTA_NAME}">` +
        `<title>${AI_TA_KRAJTA_NAME}</title>` +
        `<rect width="${viewBoxSize}" height="${viewBoxSize}" rx="${cornerRadius}" ry="${cornerRadius}"` +
        ` fill="${AI_TA_KRAJTA_COLORS.MOSS}"/>` +
        `<g transform="translate(${MARK_HORIZONTAL_OFFSET} ${MARK_VERTICAL_OFFSET})">${markMarkup}</g>` +
        `</svg>`
    );
}
