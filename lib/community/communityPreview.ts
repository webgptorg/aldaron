import {
    countApprovedMemberMessages,
    countCommunityMembers,
    countCommunityProjects,
    countHeldWebinars,
    countMemberReactions,
    loadCommunityModeratorParticipantIds,
    loadRecentCommunityDiscussionRows,
    loadRecentlyPopularReactions,
} from '@/lib/community/communityPreviewDatabase';
import { EMPTY_COMMUNITY_PREVIEW, type CommunityPreview } from '@/lib/community/communityPreviewTypes';
import {
    createCommunityPreviewDiscussion,
    createCommunityPreviewProject,
    selectCommunityPreviewPoll,
} from '@/lib/community/communityPreviewValues';
import { loadCommunityProjects } from '@/lib/community-projects/communityProjectDatabase';
import type { EventType } from '@/lib/events/eventTypes';
import { findPublishedCommunity, getWorkshopDatabaseOrNull, loadWorkshopPolls } from '@/lib/workshops/workshopDatabase';
import { loadUpcomingPublishedEventSummaries } from '@/lib/workshops/workshopPublic';

/**
 * The kind of event the membership speaks about
 *
 * Note: The free live webinar is the one event whose recording the membership opens, so only its terms are listed and
 *       counted here. A paid workshop is a different offer and must never be presented as a webinar whose recording a
 *       member gets.
 */
const COMMUNITY_WEBINAR_EVENT_TYPE: EventType = 'online-workshop';

const COMMUNITY_PREVIEW_DISCUSSION_COUNT = 3;
const COMMUNITY_PREVIEW_PROJECT_COUNT = 3;
const COMMUNITY_PREVIEW_WEBINAR_COUNT = 4;
const COMMUNITY_PREVIEW_REACTION_COUNT = 5;

/**
 * How many of the newest reactions decide which ones the preview flies
 */
const COMMUNITY_PREVIEW_REACTION_SAMPLE_COUNT = 500;

/**
 * Reads the living community as a public page may show it
 *
 * Note: A missing database, an unreadable table or a community which was never published all end as a preview with
 *       nothing in it, so the membership page keeps working and simply says less about the community.
 */
export async function loadCommunityPreview(): Promise<CommunityPreview> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return EMPTY_COMMUNITY_PREVIEW;
    }

    const communityRow = await findPublishedCommunity(supabase);
    if (communityRow === null) {
        return EMPTY_COMMUNITY_PREVIEW;
    }

    const [
        memberCount,
        messageCount,
        reactionCount,
        projectCount,
        heldWebinarCount,
        discussionRows,
        projectsResult,
        upcomingWebinarOccurrences,
        pollsResult,
        popularReactions,
    ] = await Promise.all([
        countCommunityMembers(supabase, communityRow.id),
        countApprovedMemberMessages(supabase),
        countMemberReactions(supabase),
        countCommunityProjects(supabase),
        countHeldWebinars(supabase, COMMUNITY_WEBINAR_EVENT_TYPE),
        loadRecentCommunityDiscussionRows(supabase, communityRow.id, COMMUNITY_PREVIEW_DISCUSSION_COUNT),
        loadCommunityProjects(supabase, null, COMMUNITY_PREVIEW_PROJECT_COUNT),
        loadUpcomingPublishedEventSummaries(COMMUNITY_WEBINAR_EVENT_TYPE),
        loadWorkshopPolls(supabase, communityRow, null),
        loadRecentlyPopularReactions(
            supabase,
            COMMUNITY_PREVIEW_REACTION_SAMPLE_COUNT,
            COMMUNITY_PREVIEW_REACTION_COUNT,
        ),
    ]);

    if (projectsResult.errorMessage !== null) {
        console.error('Failed to load the projects of the community preview:', projectsResult.errorMessage);
    }
    if (pollsResult.errorMessage !== null) {
        console.error('Failed to load the polls of the community preview:', pollsResult.errorMessage);
    }

    // Note: Only the people who wrote the shown messages are looked up, so the badge of a moderator costs one query
    //       over three names rather than a read of the whole community.
    const moderatorParticipantIds = await loadCommunityModeratorParticipantIds(
        supabase,
        communityRow.id,
        discussionRows
            .map((discussionRow) => discussionRow.participant_id)
            .filter((participantId): participantId is string => participantId !== null),
    );

    return {
        totals: { memberCount, messageCount, reactionCount, projectCount, heldWebinarCount },
        // Note: The newest messages are read first and then turned around, so the preview holds the current
        //       conversation and still reads it in the order it was written.
        discussions: [...discussionRows]
            .reverse()
            .map((discussionRow) => createCommunityPreviewDiscussion(discussionRow, moderatorParticipantIds)),
        projects: (projectsResult.projects ?? []).map(createCommunityPreviewProject),
        upcomingWebinars: upcomingWebinarOccurrences
            .slice(0, COMMUNITY_PREVIEW_WEBINAR_COUNT)
            .map((occurrence) => ({ id: occurrence.id, title: occurrence.title, startsAt: occurrence.startsAt })),
        poll: selectCommunityPreviewPoll(pollsResult.polls),
        popularReactions,
    };
}
