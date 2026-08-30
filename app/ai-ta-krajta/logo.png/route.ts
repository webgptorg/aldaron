import { createAiTaKrajtaIconSvg } from '@/businesses/ai-ta-krajta/aiTaKrajtaIcon';
import sharp from 'sharp';

export const dynamic = 'force-static';

/**
 * Serves the icon a home screen and an installed application show.
 *
 * It is the same drawing as the icon of the browser tab, only square, because those platforms cut their own rounding
 * out of an icon and draw a transparent pixel of one black.
 */
export async function GET(): Promise<Response> {
    const iconImage = await sharp(Buffer.from(createAiTaKrajtaIconSvg('square')))
        .png()
        .toBuffer();

    return new Response(new Uint8Array(iconImage), {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}
