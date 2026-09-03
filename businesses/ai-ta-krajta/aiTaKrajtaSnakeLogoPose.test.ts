import {
    AI_TA_KRAJTA_MARK_SPINE_POINTS,
    placeAiTaKrajtaMarkPointInFrame,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import { createSnakeState, type SnakeBounds } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { describe, expect, it } from 'vitest';

const MARK_FRAME: AiTaKrajtaMarkFrame = {
    left: 96,
    top: 96,
    width: 256,
    height: 256,
};

const BOUNDS: SnakeBounds = { width: 448, height: 448 };

describe('AI ta Krajta snake logo pose', () => {
    it('begins at the exact displayed head of the mark and keeps its tail in the same frame', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);
        const firstSpinePoint = AI_TA_KRAJTA_MARK_SPINE_POINTS[0];
        const lastSpinePoint = AI_TA_KRAJTA_MARK_SPINE_POINTS[AI_TA_KRAJTA_MARK_SPINE_POINTS.length - 1];

        expect(firstSpinePoint).toBeDefined();
        expect(lastSpinePoint).toBeDefined();
        expect(pose.headPosition).toEqual(placeAiTaKrajtaMarkPointInFrame(firstSpinePoint!, MARK_FRAME));
        expect(pose.trail.at(-1)).toEqual(placeAiTaKrajtaMarkPointInFrame(lastSpinePoint!, MARK_FRAME));
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
});
