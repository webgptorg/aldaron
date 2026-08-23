import fixture from './workshop-fixture.json';

export const E2E_WORKSHOP_SLUG = fixture.workshop.slug;
export const E2E_COMMUNITY_SLUG = fixture.community.slug;

function mapWorkshopDetails(row: typeof fixture.workshop | typeof fixture.community) {
    return {
        id: row.id,
        kind: row.room_kind,
        slug: row.slug,
        title: row.title,
        description: row.description,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        youtubeVideoId: row.youtube_video_id,
        isPublished: row.is_published,
        allowedReactions: row.allowed_reactions,
        disabledPanels: row.disabled_panels,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function createE2EWorkshopState(
    room: 'workshop' | 'community',
    fullname: string,
    email: string,
) {
    const row = room === 'workshop' ? fixture.workshop : fixture.community;

    return {
        serverTime: '2030-09-30T12:00:00.000Z',
        workshop: mapWorkshopDetails(row),
        participant: {
            id: 'e2e-participant-id',
            fullname,
            email,
            connectedAt: '2030-09-30T11:00:00.000Z',
            isInteractionBanned: false,
            isTrusted: false,
            isModerator: false,
        },
        watchingParticipantCount: 0,
        contentBlocks: [],
        nextContentUnlockAt: null,
        comments: [],
        recentReactions: [],
        reactionCounts: [],
    };
}

export const E2E_WORKSHOP_AVAILABILITIES = [
    { workshopDateId: '2026-09-04', registeredParticipantCount: 0, remainingSeatCount: 10 },
    { workshopDateId: '2026-09-09', registeredParticipantCount: 0, remainingSeatCount: 50 },
] as const;
