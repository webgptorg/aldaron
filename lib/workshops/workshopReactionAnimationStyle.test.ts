import {
    createWorkshopReactionDecorationStyle,
    createWorkshopReactionStyle,
} from '@/lib/workshops/workshopReactionAnimationStyle';
import { getWorkshopReactionAnimation } from '@/lib/workshops/workshopReactionAnimations';
import { describe, expect, it } from 'vitest';

const SAMPLE_FLIGHT_IDS = Array.from({ length: 200 }).map((_, flightIndex) => `reaction-${flightIndex}-1755000000000`);
const PARTY_ANIMATION = getWorkshopReactionAnimation('🎉');
const CODE_ANIMATION = getWorkshopReactionAnimation('</>');

function readNumber(value: string): number {
    return Number.parseFloat(value);
}

describe('workshop reaction animation style', () => {
    it('gives the very same flight the very same path every single time', () => {
        expect(createWorkshopReactionStyle('reaction-7', PARTY_ANIMATION)).toEqual(
            createWorkshopReactionStyle('reaction-7', PARTY_ANIMATION),
        );
        expect(createWorkshopReactionDecorationStyle('reaction-7', 1)).toEqual(
            createWorkshopReactionDecorationStyle('reaction-7', 1),
        );
    });

    it('spreads the reactions over the whole stage instead of stacking them', () => {
        const horizontalPositions = SAMPLE_FLIGHT_IDS.map(
            (flightId) => createWorkshopReactionStyle(flightId, PARTY_ANIMATION).left,
        );

        expect(new Set(horizontalPositions).size).toBeGreaterThan(SAMPLE_FLIGHT_IDS.length / 3);
    });

    it('keeps every reaction inside the stage it flies over', () => {
        SAMPLE_FLIGHT_IDS.forEach((flightId) => {
            const style = createWorkshopReactionStyle(flightId, PARTY_ANIMATION);
            const horizontalPositionPercent = readNumber(String(style.left));

            expect(horizontalPositionPercent).toBeGreaterThanOrEqual(0);
            expect(horizontalPositionPercent).toBeLessThanOrEqual(90);
            expect(readNumber(style['--workshop-reaction-rise'])).toBeLessThan(0);
            expect(readNumber(style['--workshop-reaction-rise'])).toBeGreaterThan(-300);
            expect(Math.abs(readNumber(style['--workshop-reaction-drift']))).toBeLessThanOrEqual(34);
            expect(Math.abs(readNumber(style['--workshop-reaction-spin']))).toBeLessThanOrEqual(14);
        });
    });

    it('starts a text reaction closer to the middle, so that a whole chip stays readable', () => {
        const textPositions = SAMPLE_FLIGHT_IDS.map((flightId) =>
            readNumber(String(createWorkshopReactionStyle(flightId, CODE_ANIMATION).left)),
        );

        expect(Math.max(...textPositions)).toBeLessThan(60);
    });

    it('hands the stylesheet the duration and the size of the animation it was asked for', () => {
        const partyStyle = createWorkshopReactionStyle('reaction-7', PARTY_ANIMATION);

        expect(partyStyle['--workshop-reaction-duration']).toBe(`${PARTY_ANIMATION.durationMilliseconds}ms`);
        expect(readNumber(partyStyle['--workshop-reaction-scale'])).toBeGreaterThan(PARTY_ANIMATION.scale * 0.85);
        expect(readNumber(partyStyle['--workshop-reaction-scale'])).toBeLessThan(PARTY_ANIMATION.scale * 1.2);
    });

    it('throws the decorations of one reaction to both sides and always upwards', () => {
        SAMPLE_FLIGHT_IDS.forEach((flightId) => {
            const firstDecorationStyle = createWorkshopReactionDecorationStyle(flightId, 0);
            const secondDecorationStyle = createWorkshopReactionDecorationStyle(flightId, 1);

            expect(readNumber(firstDecorationStyle['--workshop-reaction-decoration-drift'])).toBeGreaterThan(0);
            expect(readNumber(secondDecorationStyle['--workshop-reaction-decoration-drift'])).toBeLessThan(0);
            expect(readNumber(firstDecorationStyle['--workshop-reaction-decoration-rise'])).toBeLessThan(0);
            expect(readNumber(secondDecorationStyle['--workshop-reaction-decoration-rise'])).toBeGreaterThan(-100);
        });
    });

    it('sends the decorations of one reaction different ways instead of drawing them over each other', () => {
        const sharedRiseCount = SAMPLE_FLIGHT_IDS.filter(
            (flightId) =>
                createWorkshopReactionDecorationStyle(flightId, 0)['--workshop-reaction-decoration-rise'] ===
                createWorkshopReactionDecorationStyle(flightId, 1)['--workshop-reaction-decoration-rise'],
        ).length;

        expect(sharedRiseCount).toBeLessThan(SAMPLE_FLIGHT_IDS.length / 10);
    });
});
