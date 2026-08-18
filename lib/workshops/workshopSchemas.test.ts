import {
    workshopArtificialCommentSchema,
    workshopArtificialReactionSchema,
    workshopCommentArtificialUpvoteSchema,
    workshopConnectionSchema,
    workshopContentCreateSchema,
    workshopCreateSchema,
    workshopReactionSchema,
} from '@/lib/workshops/workshopSchemas';
import { describe, expect, it } from 'vitest';

const VALID_WORKSHOP = {
    slug: 'production-ai-2026',
    title: 'Produkční AI',
    description: '',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    youtubeVideoId: null,
    isPublished: true,
    allowedReactions: ['👍', '👏'],
} as const;

describe('workshop request validation', () => {
    it('normalizes participant identity before it is stored', () => {
        expect(workshopConnectionSchema.parse({ fullname: '  Jana Nováková  ', email: ' JANA@EXAMPLE.COM ' })).toEqual({
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
        });
    });

    it('accepts a YouTube URL and stores only its stable video ID', () => {
        const workshop = workshopCreateSchema.parse({
            ...VALID_WORKSHOP,
            youtubeVideoId: 'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share',
        });

        expect(workshop.youtubeVideoId).toBe('dQw4w9WgXcQ');
    });

    it('rejects duplicate reactions and an end before the start', () => {
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, allowedReactions: ['👏', '👏'] }).success).toBe(
            false,
        );
        expect(
            workshopCreateSchema.safeParse({
                ...VALID_WORKSHOP,
                endsAt: '2026-08-20T18:59:59+02:00',
            }).success,
        ).toBe(false);
    });

    it('allows content to unlock days after a workshop', () => {
        expect(
            workshopContentCreateSchema.safeParse({
                title: 'Záznam',
                bodyMarkdown: '[Stáhnout materiály](https://example.com)',
                unlockAt: '2026-08-22T19:00:00+02:00',
                sortOrder: 20,
                isPublished: true,
            }).success,
        ).toBe(true);
    });

    it('trims an allowed reaction before comparing it with workshop settings', () => {
        expect(workshopReactionSchema.parse({ emoji: '  👏  ' })).toEqual({ emoji: '👏' });
    });

    it('validates artificial workshop actions independently from participant actions', () => {
        expect(
            workshopArtificialCommentSchema.parse({ authorName: ' Moderátor ', body: ' Přidejme tento dotaz. ' }),
        ).toEqual({ authorName: 'Moderátor', body: 'Přidejme tento dotaz.' });
        expect(workshopArtificialReactionSchema.parse({ emoji: ' 🚀 ' })).toEqual({ emoji: '🚀' });
        expect(workshopCommentArtificialUpvoteSchema.parse({ artificialUpvoteAdjustment: -12 })).toEqual({
            artificialUpvoteAdjustment: -12,
        });
        expect(workshopCommentArtificialUpvoteSchema.safeParse({ artificialUpvoteAdjustment: 0 }).success).toBe(false);
    });
});
