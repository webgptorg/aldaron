import {
    AI_TA_KRAJTA_MARK_BOUNDS,
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    createAiTaKrajtaMarkGradientId,
    type AiTaKrajtaMarkShape,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
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
 * What the gradients of a generated icon are named after
 *
 * Note: An icon is a document of its own, so a single fixed name is enough and nothing has to be generated per render.
 */
const ICON_DOCUMENT_ID = 'icon';

/**
 * How far the mark is moved to put the animal, rather than its view box, in the middle of the tile
 */
const MARK_HORIZONTAL_OFFSET =
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE / 2 - (AI_TA_KRAJTA_MARK_BOUNDS.left + AI_TA_KRAJTA_MARK_BOUNDS.right) / 2;
const MARK_VERTICAL_OFFSET =
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE / 2 - (AI_TA_KRAJTA_MARK_BOUNDS.top + AI_TA_KRAJTA_MARK_BOUNDS.bottom) / 2;

/**
 * One drawn part of the snake, as SVG markup
 */
function createMarkShapeMarkup(shape: AiTaKrajtaMarkShape): string {
    return `<path d="${shape.pathData}" fill="url(#${createAiTaKrajtaMarkGradientId(ICON_DOCUMENT_ID, shape.id)})"/>`;
}

/**
 * The gradient of one drawn part, as markup for the `defs` of a generated icon
 */
function createMarkGradientMarkup(shape: AiTaKrajtaMarkShape): string {
    const stopsMarkup = shape.gradient.stops
        .map((stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}"/>`)
        .join('');

    return (
        `<linearGradient id="${createAiTaKrajtaMarkGradientId(ICON_DOCUMENT_ID, shape.id)}"` +
        ` x1="${shape.gradient.x1}" y1="${shape.gradient.y1}" x2="${shape.gradient.x2}" y2="${shape.gradient.y2}"` +
        ` gradientUnits="userSpaceOnUse">${stopsMarkup}</linearGradient>`
    );
}

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
    const markMarkup = AI_TA_KRAJTA_MARK_SHAPES.map(createMarkShapeMarkup).join('');
    const gradientsMarkup = AI_TA_KRAJTA_MARK_SHAPES.map(createMarkGradientMarkup).join('');

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"` +
        ` width="${AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS}" height="${AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS}"` +
        ` fill="none" role="img" aria-label="${AI_TA_KRAJTA_NAME}">` +
        `<title>${AI_TA_KRAJTA_NAME}</title>` +
        `<defs>${gradientsMarkup}</defs>` +
        `<rect width="${viewBoxSize}" height="${viewBoxSize}" rx="${cornerRadius}" ry="${cornerRadius}"` +
        ` fill="${AI_TA_KRAJTA_COLORS.MOSS}"/>` +
        `<g transform="translate(${MARK_HORIZONTAL_OFFSET} ${MARK_VERTICAL_OFFSET})">${markMarkup}</g>` +
        `</svg>`
    );
}
