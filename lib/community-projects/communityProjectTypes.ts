/**
 * A member's one possible reaction to a shared project. Repeating the same action removes it, while choosing the
 * other action replaces it, just like a Reddit vote.
 */
export const COMMUNITY_PROJECT_VOTE_VALUES = ['up', 'down'] as const;

export type CommunityProjectVote = (typeof COMMUNITY_PROJECT_VOTE_VALUES)[number];

/**
 * The card-shaped public projection of a project. It intentionally carries no e-mail address or internal discussion
 * participant identity; members only need the display name of its author and their own vote.
 */
export type CommunityProject = {
    readonly id: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
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
