import { createAiTaKrajtaIconSvg, type AiTaKrajtaIconTileShape } from '@/businesses/ai-ta-krajta/aiTaKrajtaIcon';
import { AI_TA_KRAJTA_MARK_BODY_SLICES } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS } from '@/businesses/ai-ta-krajta/config';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

/**
 * Alpha of a fully transparent pixel, which is what a browser tab shows through the corners of a rounded icon
 */
const TRANSPARENT_ALPHA = 0;

/**
 * Alpha of a fully opaque pixel
 */
const OPAQUE_ALPHA = 255;

type RasterizedIcon = {
    readonly width: number;
    readonly height: number;
    readonly readAlpha: (x: number, y: number) => number;
};

/**
 * Draws an icon the way a browser draws it, so that its pixels can be looked at
 */
async function rasterizeIcon(tileShape: AiTaKrajtaIconTileShape): Promise<RasterizedIcon> {
    const { data, info } = await sharp(Buffer.from(createAiTaKrajtaIconSvg(tileShape)))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    return {
        width: info.width,
        height: info.height,
        readAlpha: (x, y) => data[(y * info.width + x) * info.channels + 3],
    };
}

/**
 * The four pixels the cover artwork of the show paints white
 */
function readCornerAlphas(icon: RasterizedIcon): readonly number[] {
    return [
        icon.readAlpha(0, 0),
        icon.readAlpha(icon.width - 1, 0),
        icon.readAlpha(0, icon.height - 1),
        icon.readAlpha(icon.width - 1, icon.height - 1),
    ];
}

describe('AI ta Krajta icon', () => {
    it('is drawn at the size it is offered at', async () => {
        const icon = await rasterizeIcon('rounded');

        expect(icon.width).toBe(AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS);
        expect(icon.height).toBe(AI_TA_KRAJTA_ICON_SIZE_IN_PIXELS);
    });

    it('leaves nothing in the corners of the icon a browser tab draws as it is', async () => {
        const icon = await rasterizeIcon('rounded');

        expect(readCornerAlphas(icon)).toEqual([
            TRANSPARENT_ALPHA,
            TRANSPARENT_ALPHA,
            TRANSPARENT_ALPHA,
            TRANSPARENT_ALPHA,
        ]);
        expect(icon.readAlpha(Math.floor(icon.width / 2), Math.floor(icon.height / 2))).toBe(OPAQUE_ALPHA);
    });

    it('fills the corners of the icon a home screen rounds itself', async () => {
        const icon = await rasterizeIcon('square');

        expect(readCornerAlphas(icon)).toEqual([OPAQUE_ALPHA, OPAQUE_ALPHA, OPAQUE_ALPHA, OPAQUE_ALPHA]);
    });

    it('draws the very same snake as the logo of the page', () => {
        const iconSvg = createAiTaKrajtaIconSvg('rounded');

        expect(AI_TA_KRAJTA_MARK_BODY_SLICES.length).toBeGreaterThan(0);

        for (const slice of AI_TA_KRAJTA_MARK_BODY_SLICES) {
            expect(iconSvg).toContain(
                `<path d="${slice.pathData}" stroke="${slice.color}" stroke-width="${slice.strokeWidth}"`,
            );
        }
    });

    it('lays the parts of the snake over each other in the order the logo lays them', () => {
        const iconSvg = createAiTaKrajtaIconSvg('rounded');
        const drawnPathData = Array.from(iconSvg.matchAll(/<path d="([^"]+)"/g)).map((match) => match[1]);

        expect(drawnPathData).toEqual(AI_TA_KRAJTA_MARK_BODY_SLICES.map((slice) => slice.pathData));
    });
});
