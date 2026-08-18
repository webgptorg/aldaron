import { mergeWorkshopAdminSnapshot } from '@/businesses/workshop-admin/workshopAdminSnapshot';
import type { WorkshopAdminSnapshot } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createSnapshot(workshopUpdatedAt: string, contentUpdatedAt: string): WorkshopAdminSnapshot {
    return {
        workshop: {
            id: 'workshop-1',
            slug: 'workshop-1',
            title: 'Workshop',
            description: '',
            startsAt: '2026-08-20T17:00:00.000Z',
            endsAt: null,
            youtubeVideoId: null,
            isPublished: true,
            allowedReactions: ['👏'],
            createdAt: '2026-08-01T17:00:00.000Z',
            updatedAt: workshopUpdatedAt,
        },
        contentBlocks: [
            {
                id: 'content-1',
                title: 'Materiály',
                bodyMarkdown: 'Text',
                unlockAt: '2026-08-20T17:00:00.000Z',
                sortOrder: 10,
                isPublished: true,
                createdAt: '2026-08-01T17:00:00.000Z',
                updatedAt: contentUpdatedAt,
            },
        ],
        comments: [],
        participants: [],
        participantCount: 0,
        commentCount: 0,
        reactionCount: 0,
        artificialReactionCount: 0,
    };
}

describe('workshop admin snapshot merging', () => {
    it('preserves unchanged form records during a polling refresh', () => {
        const currentSnapshot = createSnapshot('2026-08-01T17:00:00.000Z', '2026-08-01T17:00:00.000Z');
        const loadedSnapshot = createSnapshot('2026-08-01T17:00:00.000Z', '2026-08-01T17:00:00.000Z');

        const mergedSnapshot = mergeWorkshopAdminSnapshot(currentSnapshot, loadedSnapshot);

        expect(mergedSnapshot.workshop).toBe(currentSnapshot.workshop);
        expect(mergedSnapshot.contentBlocks[0]).toBe(currentSnapshot.contentBlocks[0]);
    });

    it('uses a new record only when its persisted revision changed', () => {
        const currentSnapshot = createSnapshot('2026-08-01T17:00:00.000Z', '2026-08-01T17:00:00.000Z');
        const loadedSnapshot = createSnapshot('2026-08-01T17:01:00.000Z', '2026-08-01T17:01:00.000Z');

        const mergedSnapshot = mergeWorkshopAdminSnapshot(currentSnapshot, loadedSnapshot);

        expect(mergedSnapshot.workshop).toBe(loadedSnapshot.workshop);
        expect(mergedSnapshot.contentBlocks[0]).toBe(loadedSnapshot.contentBlocks[0]);
    });
});
