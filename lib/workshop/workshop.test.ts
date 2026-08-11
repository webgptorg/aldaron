import { describe, expect, it } from 'vitest';
import { formatCountdownNumber, getCountdownParts } from './countdown';
import { fromDateTimeLocalInputValue, toDateTimeLocalInputValue } from './dateTimeLocalInput';
import { isContentBlockUnlocked, selectUnlockedContentBlocks } from './selectUnlockedContentBlocks';
import { summarizeReactions } from './summarizeReactions';
import type { WorkshopContentBlock, WorkshopReaction } from './workshopTypes';
import { readOptionalDateTime, readReactionEmoji, readRowId, readText } from './workshopValidation';
import { createYoutubeEmbedUrl, extractYoutubeVideoId } from './youtubeEmbed';

const WORKSHOP_ID = 'cs-online-workshop';

/**
 * Build one content block where only the interesting values are filled in
 */
function buildContentBlock(contentBlockValues: Partial<WorkshopContentBlock>): WorkshopContentBlock {
    return {
        id: 1,
        workshopId: WORKSHOP_ID,
        createdAt: '2026-08-20T16:00:00.000Z',
        title: 'Block',
        contentMarkdown: '',
        unlockedAt: null,
        sortOrder: 0,
        ...contentBlockValues,
    };
}

/**
 * Build one reaction where only the interesting values are filled in
 */
function buildReaction(reactionValues: Partial<WorkshopReaction>): WorkshopReaction {
    return {
        id: 1,
        workshopId: WORKSHOP_ID,
        createdAt: '2026-08-20T17:00:00.000Z',
        participantId: 'participant-1',
        reactionEmoji: '👏',
        ...reactionValues,
    };
}

describe('unlocking of the workshop content', () => {
    const DURING_THE_WORKSHOP = new Date('2026-08-20T17:30:00.000Z');

    it('keeps a draft without a moment away from the participants', () => {
        expect(isContentBlockUnlocked(buildContentBlock({ unlockedAt: null }), DURING_THE_WORKSHOP)).toBe(false);
    });

    it('reveals a block whose moment already came', () => {
        const contentBlock = buildContentBlock({ unlockedAt: '2026-08-20T17:29:00.000Z' });

        expect(isContentBlockUnlocked(contentBlock, DURING_THE_WORKSHOP)).toBe(true);
    });

    it('still hides a block whose moment is one second away', () => {
        const contentBlock = buildContentBlock({ unlockedAt: '2026-08-20T17:30:01.000Z' });

        expect(isContentBlockUnlocked(contentBlock, DURING_THE_WORKSHOP)).toBe(false);
    });

    it('reveals a block unlocked days after the workshop only on that day', () => {
        const contentBlock = buildContentBlock({ unlockedAt: '2026-08-22T17:00:00.000Z' });

        expect(isContentBlockUnlocked(contentBlock, DURING_THE_WORKSHOP)).toBe(false);
        expect(isContentBlockUnlocked(contentBlock, new Date('2026-08-22T18:00:00.000Z'))).toBe(true);
    });

    it('sends only the unlocked blocks, in the order given by the administration', () => {
        const contentBlocks = [
            buildContentBlock({ id: 3, title: 'Later', unlockedAt: '2026-08-20T17:00:00.000Z', sortOrder: 20 }),
            buildContentBlock({ id: 1, title: 'Draft', unlockedAt: null, sortOrder: 5 }),
            buildContentBlock({ id: 2, title: 'First', unlockedAt: '2026-08-20T17:00:00.000Z', sortOrder: 10 }),
            buildContentBlock({ id: 4, title: 'Tomorrow', unlockedAt: '2026-08-21T17:00:00.000Z', sortOrder: 15 }),
        ];

        expect(selectUnlockedContentBlocks(contentBlocks, DURING_THE_WORKSHOP).map((block) => block.title)).toEqual([
            'First',
            'Later',
        ]);
    });
});

describe('counting of the reactions', () => {
    const NOW = new Date('2026-08-20T17:30:00.000Z');

    it('lists every offered reaction, even the ones nobody sent', () => {
        const summaries = summarizeReactions([], NOW);

        expect(summaries.length).toBeGreaterThan(0);
        expect(summaries.every((summary) => summary.totalCount === 0)).toBe(true);
    });

    it('counts the reactions per emoji and tells the fresh ones apart', () => {
        const reactions = [
            buildReaction({ id: 1, reactionEmoji: '👏', createdAt: '2026-08-20T17:29:55.000Z' }),
            buildReaction({ id: 2, reactionEmoji: '👏', createdAt: '2026-08-20T17:00:00.000Z' }),
            buildReaction({ id: 3, reactionEmoji: '🔥', createdAt: '2026-08-20T17:29:59.000Z' }),
        ];

        const summaries = summarizeReactions(reactions, NOW);
        const clapping = summaries.find((summary) => summary.reactionEmoji === '👏');

        expect(clapping).toEqual({ reactionEmoji: '👏', totalCount: 2, recentCount: 1 });
        expect(summaries.find((summary) => summary.reactionEmoji === '🔥')?.recentCount).toBe(1);
    });
});

describe('countdown until the workshop', () => {
    it('splits the remaining time into days, hours, minutes and seconds', () => {
        const countdownParts = getCountdownParts(
            new Date('2026-08-22T19:34:05.000Z'),
            new Date('2026-08-20T17:30:00.000Z'),
        );

        expect(countdownParts).toMatchObject({ days: 2, hours: 2, minutes: 4, seconds: 5, isElapsed: false });
    });

    it('never counts into the negative numbers once the workshop started', () => {
        const countdownParts = getCountdownParts(
            new Date('2026-08-20T17:00:00.000Z'),
            new Date('2026-08-20T17:30:00.000Z'),
        );

        expect(countdownParts).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 0, isElapsed: true });
    });

    it('writes the numbers with two digits', () => {
        expect(formatCountdownNumber(7)).toBe('07');
        expect(formatCountdownNumber(42)).toBe('42');
    });
});

describe('reading of a YouTube video', () => {
    it('takes a bare id as it is', () => {
        expect(extractYoutubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('reads the id out of every address YouTube shows', () => {
        expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('answers nothing when there is no video in the text', () => {
        expect(extractYoutubeVideoId('')).toBe(null);
        expect(extractYoutubeVideoId(null)).toBe(null);
        expect(extractYoutubeVideoId('https://www.youtube.com/')).toBe(null);
    });

    it('asks the player to start on its own', () => {
        expect(createYoutubeEmbedUrl('dQw4w9WgXcQ', { isAutoplayed: true })).toContain('autoplay=1');
        expect(createYoutubeEmbedUrl('dQw4w9WgXcQ', { isAutoplayed: false })).toContain('autoplay=0');
    });
});

describe('times filled in by the administration', () => {
    it('survives the way to the input and back', () => {
        const isoDateTime = '2026-08-20T17:00:00.000Z';

        expect(fromDateTimeLocalInputValue(toDateTimeLocalInputValue(isoDateTime))).toBe(isoDateTime);
    });

    it('understands an empty input as no moment at all', () => {
        expect(toDateTimeLocalInputValue(null)).toBe('');
        expect(fromDateTimeLocalInputValue('')).toBe(null);
    });
});

describe('what the api accepts', () => {
    it('trims a text and cuts it to the allowed length', () => {
        expect(readText('  Jana  ', 60)).toBe('Jana');
        expect(readText('x'.repeat(80), 60)).toHaveLength(60);
        expect(readText(42, 60)).toBe('');
    });

    it('reads a moment and refuses anything which is not one', () => {
        expect(readOptionalDateTime('2026-08-20T17:00:00.000Z', 'unlockedAt')).toBe('2026-08-20T17:00:00.000Z');
        expect(readOptionalDateTime('', 'unlockedAt')).toBe(null);
        expect(() => readOptionalDateTime('not a date', 'unlockedAt')).toThrow();
    });

    it('accepts only the offered reactions', () => {
        expect(readReactionEmoji('👏')).toBe('👏');
        expect(() => readReactionEmoji('🍺')).toThrow();
        expect(() => readReactionEmoji('<script>')).toThrow();
    });

    it('accepts only a real identifier of a row', () => {
        expect(readRowId('12')).toBe(12);
        expect(() => readRowId('abc')).toThrow();
        expect(() => readRowId(0)).toThrow();
    });
});
