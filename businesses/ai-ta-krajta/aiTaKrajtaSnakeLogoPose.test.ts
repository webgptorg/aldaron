import {
    AI_TA_KRAJTA_MARK_CENTER_LINE,
    placeAiTaKrajtaMarkPointInFrame,
    getAiTaKrajtaMarkFrameScale,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import {
    createAiTaKrajtaSnakeBodySlices,
    getAiTaKrajtaSnakeBodyBounds,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import {
    createSnakeState,
    getSnakeSegments,
    type SnakeBounds,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { describe, expect, it } from 'vitest';

const MARK_FRAME: AiTaKrajtaMarkFrame = {
    left: 96,
    top: 96,
    width: 256,
    height: 256,
};

const BOUNDS: SnakeBounds = { width: 448, height: 448 };

/**
 * How far the animal the game draws may sit from the animal the logo draws, in pixels of a 256 pixel wide mark
 *
 * Note: The two are the same drawing of the same body, but the game reaches it through a trail remembered at whole
 *       pixels rather than through the curve itself, which is worth about a pixel at the outermost edge.
 */
const ALLOWED_DIFFERENCE_IN_PIXELS = 1;

/**
 * The rectangle the animal of the still logo occupies inside the frame it is drawn in
 */
function getMarkBoundsInFrame() {
    const centerLineInFrame = AI_TA_KRAJTA_MARK_CENTER_LINE.map((point) =>
        placeAiTaKrajtaMarkPointInFrame(point, MARK_FRAME),
    );

    return getAiTaKrajtaSnakeBodyBounds(centerLineInFrame, getAiTaKrajtaMarkFrameScale(MARK_FRAME));
}

describe('AI ta Krajta snake logo pose', () => {
    it('begins at the exact displayed head of the mark and keeps its tail in the same frame', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);
        const firstCenterLinePoint = AI_TA_KRAJTA_MARK_CENTER_LINE[0];
        const lastCenterLinePoint = AI_TA_KRAJTA_MARK_CENTER_LINE[AI_TA_KRAJTA_MARK_CENTER_LINE.length - 1];

        expect(firstCenterLinePoint).toBeDefined();
        expect(lastCenterLinePoint).toBeDefined();
        expect(pose.headPosition).toEqual(placeAiTaKrajtaMarkPointInFrame(firstCenterLinePoint!, MARK_FRAME));
        expect(pose.trail.at(-1)).toEqual(placeAiTaKrajtaMarkPointInFrame(lastCenterLinePoint!, MARK_FRAME));
        expect(pose.headAngleInRadians).toBeLessThan(0);
        expect(pose.segmentCount).toBeGreaterThan(2);
    });

    it('lets the ordinary simulation keep the logo-shaped pose instead of replacing it at startup', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);
        const state = createSnakeState(BOUNDS, () => 0.5, pose);

        expect(state.headPosition).toEqual(pose.headPosition);
        expect(state.trail).toEqual(pose.trail);
        expect(state.segmentCount).toBe(pose.segmentCount);
        expect(state.score).toBe(0);
    });

    it('draws the very same animal the still logo draws, so nothing moves when the game takes over', () => {
        const state = createSnakeState(BOUNDS, () => 0.5, createAiTaKrajtaSnakeLogoPose(MARK_FRAME));
        const playedBounds = getAiTaKrajtaSnakeBodyBounds(
            getSnakeSegments(state),
            getAiTaKrajtaMarkFrameScale(MARK_FRAME),
        );
        const markBounds = getMarkBoundsInFrame();

        for (const edge of ['left', 'top', 'right', 'bottom'] as const) {
            expect(Math.abs(playedBounds[edge] - markBounds[edge])).toBeLessThan(ALLOWED_DIFFERENCE_IN_PIXELS);
        }
    });

    it('paints the released animal in the colours the still logo paints it, part for part', () => {
        const state = createSnakeState(BOUNDS, () => 0.5, createAiTaKrajtaSnakeLogoPose(MARK_FRAME));
        const frameScale = getAiTaKrajtaMarkFrameScale(MARK_FRAME);
        const playedSlices = createAiTaKrajtaSnakeBodySlices(getSnakeSegments(state), frameScale);
        const markSlices = createAiTaKrajtaSnakeBodySlices(
            AI_TA_KRAJTA_MARK_CENTER_LINE.map((point) => placeAiTaKrajtaMarkPointInFrame(point, MARK_FRAME)),
            frameScale,
        );

        expect(playedSlices.map((slice) => slice.color)).toEqual(markSlices.map((slice) => slice.color));
    });
});
