/**
 * A member's one possible reaction to a shared project. Repeating the same action removes it, while choosing the
 * other action replaces it, just like a Reddit vote.
 */
export const COMMUNITY_PROJECT_VOTE_VALUES = ['up', 'down'] as const;

export type CommunityProjectVote = (typeof COMMUNITY_PROJECT_VOTE_VALUES)[number];

/**
 * A decision a moderator or an administrator may make about a project. The database defaults a new project to
 * `pending`, while the shared participant-submission policy may auto-approve a trusted user or a moderator.
 */
export const COMMUNITY_PROJECT_MODERATION_STATUS_VALUES = ['approved', 'rejected'] as const;

export type CommunityProjectModerationStatus = (typeof COMMUNITY_PROJECT_MODERATION_STATUS_VALUES)[number];

const COMMUNITY_PROJECT_DATABASE_VOTE_BY_VOTE: Readonly<Record<CommunityProjectVote, number>> = {
    up: 1,
    down: -1,
};

const COMMUNITY_PROJECT_VOTE_BY_DATABASE_VOTE: Readonly<Record<number, CommunityProjectVote>> = {
    1: 'up',
    [-1]: 'down',
};

export function getCommunityProjectDatabaseVote(vote: CommunityProjectVote): number {
    return COMMUNITY_PROJECT_DATABASE_VOTE_BY_VOTE[vote];
}

export function getCommunityProjectVoteFromDatabaseValue(value: number | null): CommunityProjectVote | null {
    return value === null ? null : COMMUNITY_PROJECT_VOTE_BY_DATABASE_VOTE[value] ?? null;
}

/**
 * The card-shaped public projection of a project. It intentionally carries no e-mail address or internal discussion
 * participant identity; members only need the display name of its author and their own vote. A pending card reaches
 * only its author or a community moderator, exactly like a pending chat message.
 */
export type CommunityProject = {
    readonly id: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
    readonly status: WorkshopSubmissionStatus;
    readonly authorName: string;
    readonly upvoteCount: number;
    readonly downvoteCount: number;
    readonly voteByParticipant: CommunityProjectVote | null;
    readonly discussionWorkshopSlug: string;
    readonly createdAt: string;
};

export type CommunityProjectPreview = {
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
};
import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
