import {
    drawPromptbookCoderOctopus,
    PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS,
    PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS,
    type PromptbookCoderOctopusGaze,
    type PromptbookCoderOctopusMood,
    type PromptbookCoderOctopusPose,
} from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import { describe, expect, it } from 'vitest';

/**
 * Every mood and every direction the octopus can be drawn in
 */
const OCTOPUS_MOODS = [
    'WORKING',
    'WATCHING',
    'SURFING',
    'GREETING',
] as const satisfies readonly PromptbookCoderOctopusMood[];

const OCTOPUS_GAZES = [
    'CENTER',
    'LEFT',
    'RIGHT',
    'UP',
    'DOWN',
] as const satisfies readonly PromptbookCoderOctopusGaze[];

/**
 * How many frames of every animation the width is checked over, which is more than any of them has
 */
const CHECKED_FRAME_COUNT = 12;

/**
 * The octopus as the page is first served: working, eyes open, first frame of everything
 */
const RESTING_POSE: PromptbookCoderOctopusPose = {
    mood: 'WORKING',
    gaze: 'CENTER',
    isBlinking: false,
    wavePhase: 0,
    activityId: 'CODING',
    activityPhase: 0,
};

describe('drawPromptbookCoderOctopus', () => {
    it('draws the octopus writing code when nothing has happened yet', () => {
        expect(drawPromptbookCoderOctopus(RESTING_POSE)).toBe('-<OO/>= { }');
    });

    it('draws every frame at the same width, so a waving tentacle moves nothing on the page', () => {
        for (const mood of OCTOPUS_MOODS) {
            for (const gaze of OCTOPUS_GAZES) {
                for (const activityId of PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS) {
                    for (const isBlinking of [false, true]) {
                        for (let phase = 0; phase < CHECKED_FRAME_COUNT; phase++) {
                            const drawnOctopus = drawPromptbookCoderOctopus({
                                mood,
                                gaze,
                                isBlinking,
                                wavePhase: phase,
                                activityId,
                                activityPhase: phase,
                            });

                            expect(drawnOctopus, `${mood} ${gaze} ${activityId} at frame ${phase}`).toHaveLength(
                                PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS,
                            );
                        }
                    }
                }
            }
        }
    });

    it('leans its eyes the way it is looking', () => {
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, gaze: 'LEFT' })).toContain('((');
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, gaze: 'RIGHT' })).toContain('))');
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, gaze: 'UP' })).toContain("''");
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, gaze: 'DOWN' })).toContain('..');
    });

    it('shuts its eyes in the middle of a blink, wherever it was looking', () => {
        for (const gaze of OCTOPUS_GAZES) {
            expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, gaze, isBlinking: true })).toContain('--');
        }
    });

    it('throws its tentacles up and grins at whoever points at it', () => {
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'GREETING' })).toBe('\\<^^w>/    ');
    });

    it('waves those tentacles rather than holding them still', () => {
        const firstGreeting = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'GREETING', wavePhase: 0 });
        const nextGreeting = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'GREETING', wavePhase: 1 });

        expect(nextGreeting).not.toBe(firstGreeting);
    });

    it('puts its work down while it watches the pointer', () => {
        const watchingOctopus = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'WATCHING' });

        expect(watchingOctopus).not.toContain('{');
        expect(watchingOctopus.trimEnd()).toBe('-<OOo>=');
    });

    it('is blown the other way by each direction of scrolling', () => {
        const scrolledUp = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'SURFING', gaze: 'UP' });
        const scrolledDown = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'SURFING', gaze: 'DOWN' });

        expect(scrolledUp).toBe("/<''o>\\ ~  ");
        expect(scrolledDown).toBe('\\<..o>/ ~  ');
    });

    it('holds something of its own in each of its activities', () => {
        const heldThings = PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS.map((activityId) =>
            drawPromptbookCoderOctopus({ ...RESTING_POSE, activityId }),
        );

        expect(new Set(heldThings).size).toBe(PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS.length);
    });

    it('repeats its animations for as long as the page stays open', () => {
        const earlyFrames = Array.from({ length: CHECKED_FRAME_COUNT }, (_, phase) =>
            drawPromptbookCoderOctopus({ ...RESTING_POSE, wavePhase: phase, activityPhase: phase }),
        );

        expect(earlyFrames).toContain(
            drawPromptbookCoderOctopus({ ...RESTING_POSE, wavePhase: 1000, activityPhase: 1000 }),
        );
    });
});
