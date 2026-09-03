import {
    createAiTaKrajtaSnakeBodySlices,
    getAiTaKrajtaSnakeBodyBounds,
    smoothAiTaKrajtaSnakeCenterLine,
    type AiTaKrajtaSnakeBodyPoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import {
    getAiTaKrajtaSnakeColor,
    getAiTaKrajtaSnakeHalfWidth,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBodyProfile';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { describe, expect, it } from 'vitest';

/**
 * A body which turns a corner, so that smoothing and slicing have something to do
 */
const CENTER_LINE: readonly AiTaKrajtaSnakeBodyPoint[] = [
    { x: 10, y: 10 },
    { x: 10, y: 40 },
    { x: 40, y: 40 },
    { x: 70, y: 40 },
];

describe('AI ta Krajta snake body profile', () => {
    it('is thickest at the head and runs out into a point at the tip of the tail', () => {
        expect(getAiTaKrajtaSnakeHalfWidth(0)).toBeGreaterThan(getAiTaKrajtaSnakeHalfWidth(0.2));
        expect(getAiTaKrajtaSnakeHalfWidth(1)).toBeLessThan(1.5);
    });

    it('reads a thickness between the two measurements a position falls between', () => {
        const halfWidthInBetween = getAiTaKrajtaSnakeHalfWidth(0.35);

        expect(halfWidthInBetween).toBeGreaterThan(getAiTaKrajtaSnakeHalfWidth(0.3));
        expect(halfWidthInBetween).toBeLessThan(getAiTaKrajtaSnakeHalfWidth(0.4));
    });

    it('answers a position outside the animal with its nearest end', () => {
        expect(getAiTaKrajtaSnakeHalfWidth(-2)).toBe(getAiTaKrajtaSnakeHalfWidth(0));
        expect(getAiTaKrajtaSnakeHalfWidth(7)).toBe(getAiTaKrajtaSnakeHalfWidth(1));
        expect(getAiTaKrajtaSnakeColor(-2)).toBe(getAiTaKrajtaSnakeColor(0));
        expect(getAiTaKrajtaSnakeColor(7)).toBe(getAiTaKrajtaSnakeColor(1));
    });

    it('keeps the coral head and the coral tail of the mark with the indigo of its coil in between', () => {
        expect(getAiTaKrajtaSnakeColor(0)).toBe(AI_TA_KRAJTA_COLORS.CORAL);
        expect(getAiTaKrajtaSnakeColor(1)).toBe(AI_TA_KRAJTA_COLORS.CORAL);
        expect(getAiTaKrajtaSnakeColor(0.46)).toBe(AI_TA_KRAJTA_COLORS.INDIGO);
    });
});

describe('AI ta Krajta snake body', () => {
    it('rounds the corners of a centre line without moving either of its ends', () => {
        const smoothed = smoothAiTaKrajtaSnakeCenterLine(CENTER_LINE);

        expect(smoothed[0]).toEqual(CENTER_LINE[0]);
        expect(smoothed.at(-1)).toEqual(CENTER_LINE.at(-1));
        expect(smoothed.length).toBeGreaterThan(CENTER_LINE.length);
        expect(smoothed).not.toContainEqual(CENTER_LINE[1]);
    });

    it('leaves a centre line too short to bend exactly as it is', () => {
        const twoPoints = CENTER_LINE.slice(0, 2);

        expect(smoothAiTaKrajtaSnakeCenterLine(twoPoints)).toEqual(twoPoints);
    });

    it('draws the animal from the tip of its tail up to its head, so the head lies over everything', () => {
        const slices = createAiTaKrajtaSnakeBodySlices(CENTER_LINE, 1);

        expect(slices.length).toBeGreaterThan(1);
        expect(slices[0]?.strokeWidth).toBeLessThan(slices.at(-1)!.strokeWidth);
        expect(slices.at(-1)?.color).toBe(AI_TA_KRAJTA_COLORS.CORAL);
    });

    it('draws nothing at all for a centre line which is not a line', () => {
        expect(createAiTaKrajtaSnakeBodySlices([{ x: 4, y: 4 }], 1)).toEqual([]);
    });

    it('grows the whole animal, thickness and all, when it is drawn into a larger frame', () => {
        const smallBounds = getAiTaKrajtaSnakeBodyBounds(CENTER_LINE, 1);
        const thickBounds = getAiTaKrajtaSnakeBodyBounds(CENTER_LINE, 2);

        expect(thickBounds.left).toBeLessThan(smallBounds.left);
        expect(thickBounds.right).toBeGreaterThan(smallBounds.right);
        expect(createAiTaKrajtaSnakeBodySlices(CENTER_LINE, 2)[0]!.strokeWidth).toBeCloseTo(
            createAiTaKrajtaSnakeBodySlices(CENTER_LINE, 1)[0]!.strokeWidth * 2,
        );
    });

    it('reaches exactly as far around the head as the head is thick', () => {
        const bounds = getAiTaKrajtaSnakeBodyBounds(CENTER_LINE, 1);
        const headPosition = CENTER_LINE[0]!;

        expect(bounds.top).toBeCloseTo(headPosition.y - getAiTaKrajtaSnakeHalfWidth(0));
    });
});
