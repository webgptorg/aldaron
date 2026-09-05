import {
    PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS,
    type PromptbookCoderOctopusActivityId,
} from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import {
    resolvePromptbookCoderPointerAttention,
    selectPromptbookCoderOctopusPose,
    type PromptbookCoderOctopusSenses,
} from '@/components/promptbook-coder/promptbookCoderOctopusPose';
import { describe, expect, it } from 'vitest';

/**
 * An octopus nobody is doing anything to, on a page which stands still
 */
const UNBOTHERED_SENSES: PromptbookCoderOctopusSenses = {
    tick: 0,
    pointerGaze: null,
    isPointerNear: false,
    scrollDirection: null,
    isGreeting: false,
};

/**
 * How many frames the activities are followed over, which is long enough to reach every one of them
 */
const FOLLOWED_FRAME_COUNT = 400;

describe('selectPromptbookCoderOctopusPose', () => {
    it('gets on with its work while nobody bothers it', () => {
        expect(selectPromptbookCoderOctopusPose(UNBOTHERED_SENSES).mood).toBe('WORKING');
    });

    it('greets whoever points at the badge, whatever else is going on', () => {
        const pose = selectPromptbookCoderOctopusPose({
            ...UNBOTHERED_SENSES,
            isGreeting: true,
            isPointerNear: true,
            pointerGaze: 'LEFT',
            scrollDirection: 'DOWN',
        });

        expect(pose.mood).toBe('GREETING');
        expect(pose.gaze).toBe('CENTER');
    });

    it('rides a scrolled page before it minds a pointer, and looks the way the page travels', () => {
        const scrolledDown = selectPromptbookCoderOctopusPose({
            ...UNBOTHERED_SENSES,
            scrollDirection: 'DOWN',
            isPointerNear: true,
            pointerGaze: 'LEFT',
        });
        const scrolledUp = selectPromptbookCoderOctopusPose({ ...UNBOTHERED_SENSES, scrollDirection: 'UP' });

        expect(scrolledDown.mood).toBe('SURFING');
        expect(scrolledDown.gaze).toBe('DOWN');
        expect(scrolledUp.gaze).toBe('UP');
    });

    it('puts its work down for a pointer which came close', () => {
        const pose = selectPromptbookCoderOctopusPose({
            ...UNBOTHERED_SENSES,
            isPointerNear: true,
            pointerGaze: 'RIGHT',
        });

        expect(pose.mood).toBe('WATCHING');
        expect(pose.gaze).toBe('RIGHT');
    });

    it('follows a distant pointer with its eyes alone and keeps working', () => {
        const pose = selectPromptbookCoderOctopusPose({ ...UNBOTHERED_SENSES, pointerGaze: 'LEFT' });

        expect(pose.mood).toBe('WORKING');
        expect(pose.gaze).toBe('LEFT');
    });

    it('works through all of its activities and then starts over', () => {
        const followedActivityIds = new Set<PromptbookCoderOctopusActivityId>();

        for (let tick = 0; tick < FOLLOWED_FRAME_COUNT; tick++) {
            followedActivityIds.add(selectPromptbookCoderOctopusPose({ ...UNBOTHERED_SENSES, tick }).activityId);
        }

        expect(Array.from(followedActivityIds).sort()).toEqual(
            Array.from(PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS).sort(),
        );
    });

    it('blinks now and then, but never on the frame the page is served with', () => {
        const blinkedFrames = Array.from({ length: FOLLOWED_FRAME_COUNT }, (_, tick) => tick).filter(
            (tick) => selectPromptbookCoderOctopusPose({ ...UNBOTHERED_SENSES, tick }).isBlinking,
        );

        expect(selectPromptbookCoderOctopusPose(UNBOTHERED_SENSES).isBlinking).toBe(false);
        expect(blinkedFrames.length).toBeGreaterThan(0);
        expect(blinkedFrames.length).toBeLessThan(FOLLOWED_FRAME_COUNT / 2);
    });
});

describe('resolvePromptbookCoderPointerAttention', () => {
    it('looks the way the pointer lies, by whichever half of the distance is longer', () => {
        expect(resolvePromptbookCoderPointerAttention(-200, 30).pointerGaze).toBe('LEFT');
        expect(resolvePromptbookCoderPointerAttention(200, -30).pointerGaze).toBe('RIGHT');
        expect(resolvePromptbookCoderPointerAttention(30, -200).pointerGaze).toBe('UP');
        expect(resolvePromptbookCoderPointerAttention(-30, 200).pointerGaze).toBe('DOWN');
    });

    it('looks straight ahead at a pointer which stands on it', () => {
        expect(resolvePromptbookCoderPointerAttention(0, 0).pointerGaze).toBe('CENTER');
        expect(resolvePromptbookCoderPointerAttention(4, -6).pointerGaze).toBe('CENTER');
    });

    it('is only interrupted by a pointer which came close', () => {
        expect(resolvePromptbookCoderPointerAttention(80, 40).isPointerNear).toBe(true);
        expect(resolvePromptbookCoderPointerAttention(900, 400).isPointerNear).toBe(false);
    });
});
