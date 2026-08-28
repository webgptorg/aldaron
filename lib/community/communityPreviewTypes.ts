/**
 * What a public page may say about the living community
 *
 * Note: Everything here comes from the very same rooms the members read, but only in the form a stranger may see it:
 *       a total which names nobody, a message which the moderation of the community already approved, or a project
 *       which its author shared to be seen. Members are named by their first name alone, so a public page never
 *       carries more of an identity than the room itself showed.
 * Note: These are plain values without a database client, so the browser can read them without pulling the server
 *       code which gathered them into its bundle.
 */

/**
 * One approved message of the community chat
 *
 * Note: The messages are ordered as the conversation ran, so a question is read before the answer it received.
 */
export type CommunityPreviewDiscussion = {
    readonly id: string;
    readonly authorName: string;

    /**
     * Whether a moderator of the community wrote it, which the room itself also says
     */
    readonly isAuthorModerator: boolean;
    readonly body: string;
    readonly createdAt: string;
};

/**
 * One creation a member shared with the community
 */
export type CommunityPreviewProject = {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly authorName: string;
    readonly previewImageUrl: string | null;
    readonly upvoteCount: number;
};

/**
 * One term of the free live webinar, as a page which is not registering anybody for it names it
 */
export type CommunityPreviewWebinar = {
    readonly id: string;
    readonly title: string;
    readonly startsAt: string;
};

/**
 * One answer of a poll together with how much of the community chose it
 */
export type CommunityPreviewPollAnswer = {
    readonly label: string;
    readonly votePercentage: number;
};

/**
 * What the community answered together, without anything which could point at a member who answered
 */
export type CommunityPreviewPoll = {
    readonly question: string;

    /**
     * The answers which were chosen most often, from the most chosen one
     */
    readonly answers: readonly CommunityPreviewPollAnswer[];
    readonly voteCount: number;
};

/**
 * How much the community has really done, which is the one honest measure of how alive it is
 */
export type CommunityPreviewTotals = {
    readonly memberCount: number;

    /**
     * Every approved message of every public room, which is what a member of the community writes and reads
     */
    readonly messageCount: number;

    /**
     * Every reaction a member really sent, so a number seeded by the administration never inflates it
     */
    readonly reactionCount: number;
    readonly projectCount: number;
    readonly heldWebinarCount: number;
};

export type CommunityPreview = {
    readonly totals: CommunityPreviewTotals;
    readonly discussions: readonly CommunityPreviewDiscussion[];
    readonly projects: readonly CommunityPreviewProject[];
    readonly upcomingWebinars: readonly CommunityPreviewWebinar[];
    readonly poll: CommunityPreviewPoll | null;

    /**
     * The reactions the rooms really celebrate most
     *
     * Note: Nobody is reacting while a landing page is being read, so the preview flies these on its own. Which ones
     *       fly is the one thing about them which is not made up.
     */
    readonly popularReactions: readonly string[];
};

/**
 * The community as a page which could not read it describes it
 *
 * Note: An unavailable database must never take a landing page down with it, so every part of the preview simply has
 *       nothing in it and the page falls back to what it can say without the community.
 */
export const EMPTY_COMMUNITY_PREVIEW: CommunityPreview = {
    totals: {
        memberCount: 0,
        messageCount: 0,
        reactionCount: 0,
        projectCount: 0,
        heldWebinarCount: 0,
    },
    discussions: [],
    projects: [],
    upcomingWebinars: [],
    poll: null,
    popularReactions: [],
};
