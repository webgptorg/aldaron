import {
    workshopArtificialCommentSchema,
    workshopArtificialReactionSchema,
    workshopCommentArtificialUpvoteSchema,
    workshopCommentSchema,
    workshopCommentUpdateSchema,
    workshopConnectionSchema,
    workshopContentCreateSchema,
    workshopCreateSchema,
    workshopParticipantRenameSchema,
    workshopParticipantUpdateSchema,
    workshopPresenceSchema,
    workshopReactionSchema,
    workshopUpdateSchema,
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

    it('renames a participant under the very same rule the connection form uses', () => {
        expect(workshopParticipantRenameSchema.parse({ fullname: '  Jana Nová  ' })).toEqual({ fullname: 'Jana Nová' });
        expect(workshopParticipantRenameSchema.safeParse({ fullname: '   ' }).success).toBe(false);
        expect(workshopParticipantRenameSchema.safeParse({ fullname: 'A'.repeat(201) }).success).toBe(false);
        expect(workshopParticipantRenameSchema.safeParse({}).success).toBe(false);
    });

    it('reads a chat message as a reply only when it names the comment it answers', () => {
        expect(workshopCommentSchema.parse({ body: '  Kdy bude záznam?  ' })).toEqual({
            body: 'Kdy bude záznam?',
            parentCommentId: null,
        });
        expect(
            workshopCommentSchema.parse({
                body: 'Díky!',
                parentCommentId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
            }),
        ).toEqual({ body: 'Díky!', parentCommentId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde' });
        expect(workshopCommentSchema.safeParse({ body: 'Díky!', parentCommentId: 'question' }).success).toBe(false);
        expect(workshopCommentSchema.safeParse({ body: '   ' }).success).toBe(false);
    });

    it('moderates a comment, corrects its text, or does both in one admin request', () => {
        expect(workshopCommentUpdateSchema.parse({ status: 'approved' })).toEqual({ status: 'approved' });
        expect(workshopCommentUpdateSchema.parse({ body: '  Kdy bude záznam?  ' })).toEqual({
            body: 'Kdy bude záznam?',
        });
        expect(workshopCommentUpdateSchema.parse({ status: 'rejected', body: 'Opraveno.' })).toEqual({
            status: 'rejected',
            body: 'Opraveno.',
        });
        expect(workshopCommentUpdateSchema.safeParse({}).success).toBe(false);
        expect(workshopCommentUpdateSchema.safeParse({ body: '   ' }).success).toBe(false);
        expect(workshopCommentUpdateSchema.safeParse({ body: 'A'.repeat(2001) }).success).toBe(false);
        expect(workshopCommentUpdateSchema.safeParse({ status: 'pending' }).success).toBe(false);
    });

    it('pins a message on its own but never pins a message the room does not see', () => {
        expect(workshopCommentUpdateSchema.parse({ isPinned: true })).toEqual({ isPinned: true });
        expect(workshopCommentUpdateSchema.parse({ isPinned: false })).toEqual({ isPinned: false });
        expect(workshopCommentUpdateSchema.safeParse({ isPinned: true, status: 'rejected' }).success).toBe(false);
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

    it('offers every panel to a workshop which switched none of them off', () => {
        expect(workshopCreateSchema.parse(VALID_WORKSHOP).disabledPanels).toEqual([]);
        expect(
            workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, disabledPanels: ['chat', 'watching-count'] }).success,
        ).toBe(true);
    });

    it('validates a changed workshop URL slug with the same rule as creation', () => {
        expect(workshopUpdateSchema.parse({ slug: 'production-ai-september-2026' })).toEqual({
            slug: 'production-ai-september-2026',
        });
        expect(workshopUpdateSchema.safeParse({ slug: 'Production AI' }).success).toBe(false);
    });

    it('refuses an unknown or a repeated panel instead of storing it', () => {
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, disabledPanels: ['stage'] }).success).toBe(false);
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, disabledPanels: ['chat', 'chat'] }).success).toBe(
            false,
        );
        expect(workshopUpdateSchema.safeParse({ disabledPanels: ['chat'] }).success).toBe(true);
        expect(workshopUpdateSchema.safeParse({ disabledPanels: [null] }).success).toBe(false);
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

    it('accepts trusted participant changes and bounded active-time reports', () => {
        expect(workshopParticipantUpdateSchema.parse({ isTrusted: true })).toEqual({ isTrusted: true });
        expect(workshopParticipantUpdateSchema.safeParse({}).success).toBe(false);
        expect(workshopPresenceSchema.parse({ activeDurationSeconds: 30 })).toEqual({ activeDurationSeconds: 30 });
        expect(workshopPresenceSchema.safeParse({ activeDurationSeconds: 121 }).success).toBe(false);
    });
});
