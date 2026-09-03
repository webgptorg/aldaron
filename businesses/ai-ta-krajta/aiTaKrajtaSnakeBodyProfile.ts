import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';

/**
 * How thick the animal is at one point of the way from its head to the tip of its tail
 */
type AiTaKrajtaSnakeHalfWidthStop = {
    /**
     * Where along the animal this is measured, zero at the head and one at the tip of the tail
     */
    readonly bodyFraction: number;

    /**
     * Half of the thickness here, in units of the view box of the mark
     */
    readonly halfWidth: number;
};

/**
 * What colour the animal is at one point of the way from its head to the tip of its tail
 */
type AiTaKrajtaSnakeColorStop = {
    readonly bodyFraction: number;
    readonly color: string;
};

/**
 * How thick the snake of the show is along its whole length
 *
 * Note: A round head, a slimmer neck, a body which thickens again where the mark coils it up and a tail which runs
 *       out into a point. These are the widths of the drawn mark, which is why the same numbers can shape both the
 *       logo and the animal the game lets loose.
 */
const AI_TA_KRAJTA_SNAKE_HALF_WIDTH_STOPS: readonly AiTaKrajtaSnakeHalfWidthStop[] = [
    { bodyFraction: 0, halfWidth: 13.5 },
    { bodyFraction: 0.035, halfWidth: 12.5 },
    { bodyFraction: 0.075, halfWidth: 8.4 },
    { bodyFraction: 0.3, halfWidth: 8.4 },
    { bodyFraction: 0.4, halfWidth: 9.8 },
    { bodyFraction: 0.6, halfWidth: 10 },
    { bodyFraction: 0.72, halfWidth: 9.6 },
    { bodyFraction: 0.84, halfWidth: 6.5 },
    { bodyFraction: 0.93, halfWidth: 3.6 },
    { bodyFraction: 1, halfWidth: 0.9 },
];

/**
 * What colour the snake of the show is along its whole length
 *
 * Note: These are the colours the mark paints, read off its own artwork: a coral head which cools through mauve into
 *       the indigo of the coil, and the warm tail which the mark slides back out to the right. Written along the
 *       animal rather than across its picture, they stay with it once it uncoils and swims off.
 */
const AI_TA_KRAJTA_SNAKE_COLOR_STOPS: readonly AiTaKrajtaSnakeColorStop[] = [
    { bodyFraction: 0, color: AI_TA_KRAJTA_COLORS.CORAL },
    { bodyFraction: 0.09, color: '#e4778a' },
    { bodyFraction: 0.2, color: '#ca81a6' },
    { bodyFraction: 0.31, color: '#a785c7' },
    { bodyFraction: 0.46, color: AI_TA_KRAJTA_COLORS.INDIGO },
    { bodyFraction: 0.56, color: '#8589e6' },
    { bodyFraction: 0.66, color: '#a485c9' },
    { bodyFraction: 0.73, color: '#b284bc' },
    { bodyFraction: 0.83, color: AI_TA_KRAJTA_COLORS.CORAL },
    { bodyFraction: 1, color: AI_TA_KRAJTA_COLORS.CORAL },
];

/**
 * Restricts a position along the animal to its meaningful range
 */
function clampBodyFraction(bodyFraction: number): number {
    return Math.min(1, Math.max(0, bodyFraction));
}

/**
 * The two stops a position along the animal falls between, and how far it stands between them
 */
function findSurroundingStops<TStop extends { readonly bodyFraction: number }>(
    stops: readonly TStop[],
    bodyFraction: number,
): { readonly before: TStop; readonly after: TStop; readonly ratio: number } {
    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    if (firstStop === undefined || lastStop === undefined) {
        throw new Error('The snake of AI ta Krajta needs at least one measurement along its body.');
    }

    for (let stopIndex = 1; stopIndex < stops.length; stopIndex++) {
        const before = stops[stopIndex - 1];
        const after = stops[stopIndex];

        if (before === undefined || after === undefined || bodyFraction > after.bodyFraction) {
            continue;
        }

        const span = after.bodyFraction - before.bodyFraction;

        return { before, after, ratio: span === 0 ? 0 : (bodyFraction - before.bodyFraction) / span };
    }

    return { before: lastStop, after: lastStop, ratio: 0 };
}

/**
 * Half of the thickness of the animal at a position along it, in units of the view box of the mark
 */
export function getAiTaKrajtaSnakeHalfWidth(bodyFraction: number): number {
    const { before, after, ratio } = findSurroundingStops(
        AI_TA_KRAJTA_SNAKE_HALF_WIDTH_STOPS,
        clampBodyFraction(bodyFraction),
    );

    return before.halfWidth + (after.halfWidth - before.halfWidth) * ratio;
}

/**
 * Reads the three channels out of a `#rrggbb` colour
 */
function parseHexColor(color: string): readonly number[] {
    return [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
}

/**
 * Writes three channels back as a `#rrggbb` colour
 */
function formatHexColor(channels: readonly number[]): string {
    return '#' + channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('');
}

/**
 * The colour of the animal at a position along it
 */
export function getAiTaKrajtaSnakeColor(bodyFraction: number): string {
    const { before, after, ratio } = findSurroundingStops(
        AI_TA_KRAJTA_SNAKE_COLOR_STOPS,
        clampBodyFraction(bodyFraction),
    );

    if (before.color === after.color) {
        return before.color;
    }

    const beforeChannels = parseHexColor(before.color);
    const afterChannels = parseHexColor(after.color);

    return formatHexColor(
        beforeChannels.map((channel, channelIndex) => channel + ((afterChannels[channelIndex] ?? channel) - channel) * ratio),
    );
}
