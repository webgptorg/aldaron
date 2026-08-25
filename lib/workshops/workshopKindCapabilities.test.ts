import {
    getUnsupportedWorkshopKindFieldNames,
    getWorkshopKindCapabilities,
} from '@/lib/workshops/workshopKindCapabilities';
import { WORKSHOP_KIND_VALUES } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

describe('workshop kind capabilities', () => {
    it('describes every room kind, so a kind added later cannot be left without an answer', () => {
        WORKSHOP_KIND_VALUES.forEach((workshopKind) => {
            expect(getWorkshopKindCapabilities(workshopKind)).toBeDefined();
        });
    });

    it('keeps a workshop occurrence the live event it always was', () => {
        expect(getWorkshopKindCapabilities('workshop')).toEqual({
            isSingleton: false,
            isSlugFixed: false,
            isScheduled: true,
            isStageOffered: true,
            isPollsOffered: false,
            isRealtime: true,
        });
    });

    it('makes the community one calm permanent room without a schedule, a stage, or live updates', () => {
        expect(getWorkshopKindCapabilities('community')).toEqual({
            isSingleton: true,
            isSlugFixed: true,
            isScheduled: false,
            isStageOffered: false,
            isPollsOffered: true,
            isRealtime: false,
        });
    });

    it('refuses a schedule, a stage, and an address written into a room which has none of them', () => {
        expect(
            getUnsupportedWorkshopKindFieldNames('community', {
                slug: 'jina-komunita',
                startsAt: '2026-08-21T19:00:00+02:00',
                endsAt: null,
                youtubeVideoId: 'dQw4w9WgXcQ',
            }),
        ).toEqual(['startsAt', 'endsAt', 'youtubeVideoId', 'slug']);
    });

    it('leaves the address of a workshop occurrence editable', () => {
        expect(getUnsupportedWorkshopKindFieldNames('workshop', { slug: 'produkcni-kod-2026-09-10' })).toEqual([]);
    });

    it('leaves every other change of a room alone, whatever its kind', () => {
        expect(getUnsupportedWorkshopKindFieldNames('community', { title: 'Komunita Promptbooku' })).toEqual([]);
        expect(getUnsupportedWorkshopKindFieldNames('community', { startsAt: undefined })).toEqual([]);
        expect(
            getUnsupportedWorkshopKindFieldNames('workshop', {
                startsAt: '2026-08-21T19:00:00+02:00',
                endsAt: '2026-08-21T20:30:00+02:00',
                youtubeVideoId: 'dQw4w9WgXcQ',
            }),
        ).toEqual([]);
    });
});
