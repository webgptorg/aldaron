import {
    advanceSnakeState,
    createSnakeState,
    FIELD_MARGIN_IN_PIXELS,
    getSnakeSegments,
    type SnakeBounds,
    type SnakeState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { describe, expect, it } from 'vitest';

const BOUNDS: SnakeBounds = { width: 640, height: 360 };

/**
 * A source of random numbers which always answers the same, so that a test plays the same game twice
 */
function createPredictableRandomNumber(): () => number {
    let callCount = 0;

    return () => {
        callCount += 1;

        return (callCount % 7) / 7;
    };
}

/**
 * Plays the game for a while with the pointer standing still
 */
function playTowards(
    state: SnakeState,
    targetPosition: { readonly x: number; readonly y: number } | null,
    stepCount: number,
): SnakeState {
    const createRandomNumber = createPredictableRandomNumber();
    let currentState = state;

    for (let step = 0; step < stepCount; step++) {
        currentState = advanceSnakeState(currentState, {
            bounds: BOUNDS,
            targetPosition,
            stepInSeconds: 1 / 60,
            createRandomNumber,
        });
    }

    return currentState;
}

describe('aiTaKrajtaSnakeSimulation', () => {
    it('starts in the middle of the field with tokens to eat', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());

        expect(state.headPosition).toEqual({ x: 320, y: 180 });
        expect(state.score).toBe(0);
        expect(state.food.length).toBeGreaterThan(0);
    });

    it('starts with a full body behind its head', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const bodyPositions = getSnakeSegments(state).map((segment) => `${segment.x},${segment.y}`);

        expect(new Set(bodyPositions).size).toBeGreaterThan(1);
    });

    it('turns towards the pointer instead of jumping to it', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const afterOneStep = advanceSnakeState(state, {
            bounds: BOUNDS,
            targetPosition: { x: 620, y: 180 },
            stepInSeconds: 1 / 60,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expect(afterOneStep.headPosition.x).toBeLessThan(330);
        expect(afterOneStep.headAngleInRadians).toBeGreaterThan(state.headAngleInRadians);
    });

    it('chases the pointer down and then circles it, the way a snake in a browser game does', () => {
        const targetPosition = { x: 500, y: 300 };
        const createRandomNumber = createPredictableRandomNumber();
        let state = createSnakeState(BOUNDS, createRandomNumber);
        let closestDistance = Number.POSITIVE_INFINITY;

        for (let step = 0; step < 240; step++) {
            state = advanceSnakeState(state, {
                bounds: BOUNDS,
                targetPosition,
                stepInSeconds: 1 / 60,
                createRandomNumber,
            });
            closestDistance = Math.min(
                closestDistance,
                Math.hypot(state.headPosition.x - targetPosition.x, state.headPosition.y - targetPosition.y),
            );
        }

        expect(closestDistance).toBeLessThan(30);
    });

    it('stays on the field however long it glides on its own', () => {
        const state = playTowards(createSnakeState(BOUNDS, createPredictableRandomNumber()), null, 3000);

        expect(state.headPosition.x).toBeGreaterThanOrEqual(0);
        expect(state.headPosition.x).toBeLessThanOrEqual(BOUNDS.width);
        expect(state.headPosition.y).toBeGreaterThanOrEqual(0);
        expect(state.headPosition.y).toBeLessThanOrEqual(BOUNDS.height);
    });

    it('returns inward from both walls after a diagonal corner bounce', () => {
        const stateAtCorner = {
            ...createSnakeState(BOUNDS, createPredictableRandomNumber()),
            headPosition: {
                x: BOUNDS.width - FIELD_MARGIN_IN_PIXELS - 1,
                y: FIELD_MARGIN_IN_PIXELS + 1,
            },
            headAngleInRadians: -Math.PI / 4,
        };
        const targetPosition = { x: BOUNDS.width, y: 0 };
        const stateAfterCornerBounce = advanceSnakeState(stateAtCorner, {
            bounds: BOUNDS,
            targetPosition,
            stepInSeconds: 1 / 20,
            createRandomNumber: createPredictableRandomNumber(),
        });
        const stateAfterFollowingFrame = advanceSnakeState(stateAfterCornerBounce, {
            bounds: BOUNDS,
            targetPosition,
            stepInSeconds: 1 / 20,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expect(Math.cos(stateAfterCornerBounce.headAngleInRadians)).toBeLessThan(0);
        expect(Math.sin(stateAfterCornerBounce.headAngleInRadians)).toBeGreaterThan(0);
        expect(stateAfterCornerBounce.headPosition.x).toBeLessThan(stateAtCorner.headPosition.x);
        expect(stateAfterCornerBounce.headPosition.y).toBeGreaterThan(stateAtCorner.headPosition.y);
        expect(stateAfterFollowingFrame.headPosition.x).toBeLessThan(stateAfterCornerBounce.headPosition.x);
        expect(stateAfterFollowingFrame.headPosition.y).toBeGreaterThan(stateAfterCornerBounce.headPosition.y);
    });

    it('grows and scores when the head reaches a token', () => {
        const initialState = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const firstFood = initialState.food[0];
        const afterEating = playTowards(initialState, firstFood.position, 600);

        expect(afterEating.score).toBeGreaterThan(0);
        expect(afterEating.segmentCount).toBeGreaterThan(initialState.segmentCount);
        expect(afterEating.food).toHaveLength(initialState.food.length);
    });

    it('draws exactly as many segments as the body has', () => {
        const state = playTowards(createSnakeState(BOUNDS, createPredictableRandomNumber()), { x: 100, y: 100 }, 120);

        expect(getSnakeSegments(state)).toHaveLength(state.segmentCount);
        expect(getSnakeSegments(state).every((segment) => segment !== undefined)).toBe(true);
    });

    it('does not teleport when a background tab hands over one enormous step', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const afterLongStep = advanceSnakeState(state, {
            bounds: BOUNDS,
            targetPosition: { x: 10, y: 10 },
            stepInSeconds: 45,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expect(Math.hypot(afterLongStep.headPosition.x - state.headPosition.x, afterLongStep.headPosition.y - state.headPosition.y)).toBeLessThan(
            20,
        );
    });
});
