import type { AdminContactJoin } from '@/lib/admin/adminContactJoin';
import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';

/**
 * A live room is normally one workshop occurrence. The community uses the same resilient room infrastructure, but
 * remains a single, separately administered room across all occurrences.
 */
export const WORKSHOP_KIND_VALUES = ['workshop', 'community'] as const;

export type WorkshopKind = (typeof WORKSHOP_KIND_VALUES)[number];

export function isWorkshopKind(value: string): value is WorkshopKind {
    return WORKSHOP_KIND_VALUES.includes(value as WorkshopKind);
}

/**
 * The three outcomes shared by a member submission which is either immediately trusted or waiting for moderation.
 */
export type WorkshopSubmissionStatus = 'pending' | 'approved' | 'rejected';

export type WorkshopCommentStatus = WorkshopSubmissionStatus;
export type WorkshopCommentSort = 'recent' | 'upvotes';

/**
 * A member's project is moderated with the same three unambiguous outcomes as their message, but remains a separate
 * type so a future project-specific status cannot accidentally change chat semantics.
 */
export type WorkshopProjectStatus = WorkshopSubmissionStatus;

export type WorkshopSummary = {
    readonly id: string;
    readonly kind: WorkshopKind;
    readonly slug: string;
    readonly title: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly isPublished: boolean;
};

/**
 * One occurrence as the administration lists it, together with the audience it gathered
 *
 * Note: The participant count deliberately stays out of `WorkshopSummary`, so no public list of terms exposes how
 *       many people registered for them.
 */
export type WorkshopAdminSummary = WorkshopSummary & {
    readonly participantCount: number;
};

export type WorkshopDetails = WorkshopSummary & {
    readonly description: string;
    readonly youtubeVideoId: string | null;
    readonly allowedReactions: readonly string[];

    /**
     * The panels of the room an admin switched off for this workshop
     *
     * Note: Everything not listed here is offered, so a panel added later starts switched on for every workshop.
     */
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly createdAt: string;
    readonly updatedAt: string;
};

export type WorkshopParticipant = {
    readonly id: string;
    readonly fullname: string;

    /**
     * Contact address this participant connected with
     *
     * Note: A room only ever describes the very participant reading it, so this address never reaches anybody else. It
     *       is what lets a room hand a verified identity on, for example into the link leading to another room.
     */
    readonly email: string;
    readonly connectedAt: string;
    readonly isInteractionBanned: boolean;

    /**
     * Whether the messages of this participant are approved as they are written
     *
     * Note: Trust stays invisible in the room. Nothing but the approval of their own messages tells a participant or
     *       anybody else that they were trusted.
     */
    readonly isTrusted: boolean;

    /**
     * Whether this participant moderates the room, which the room says with a badge
     */
    readonly isModerator: boolean;
};

export type WorkshopAdminParticipant = WorkshopParticipant &
    AdminContactJoin & {
        readonly lastSeenAt: string;
        readonly activeDurationSeconds: number;
        readonly commentCount: number;
        readonly reactionCount: number;
        readonly upvoteCount: number;
    };

/**
 * One server-paged slice of participants, keeping large workshops responsive in the administration.
 */
export type WorkshopAdminParticipantPage = {
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly totalCount: number;
};

/**
 * One timestamped activity attributable to a participant.
 *
 * Note: These are assembled from the existing audited source records. They deliberately do not introduce a second
 * event store which could disagree with comments, reactions, or votes.
 */
export type WorkshopParticipantTimelineEvent =
    | {
          readonly kind: 'joined' | 'last-seen';
          readonly id: string;
          readonly occurredAt: string;
      }
    | {
          readonly kind: 'comment';
          readonly id: string;
          readonly occurredAt: string;
          readonly body: string;
          readonly status: WorkshopCommentStatus;
      }
    | {
          readonly kind: 'reaction';
          readonly id: string;
          readonly occurredAt: string;
          readonly emoji: string;
      }
    | {
          readonly kind: 'upvote';
          readonly id: string;
          readonly occurredAt: string;
          readonly commentId: string;
          readonly commentAuthorName: string | null;
          readonly commentBody: string | null;
      };

export type WorkshopAdminParticipantTimeline = {
    readonly participant: WorkshopAdminParticipant;
    readonly events: readonly WorkshopParticipantTimelineEvent[];
};

/**
 * Activity totals inside one compact bucket of the workshop-wide timeline.
 */
export type WorkshopAdminTimelinePoint = {
    readonly startsAt: string;

    /**
     * How many people had the room open during this bucket, which is the audience rather than an action
     *
     * Note: This is counted from the presence the room reports while it is open, so a workshop which was held before
     *       the room started reporting it has an audience of nobody however many people really watched it.
     */
    readonly watchingParticipantCount: number;

    /**
     * How many people registered into the room during this bucket
     */
    readonly participantCount: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly upvoteCount: number;
    readonly linkClickCount: number;

    /**
     * How many times each reaction was sent during this bucket, so a graph can draw one of them alone
     */
    readonly reactionCountsByEmoji: Readonly<Record<string, number>>;
};

/**
 * One message with the moment it was written, which is everything a metric counting words in the chat needs
 *
 * Note: The administration counts the matches of a regular expression in the browser, so that an expression which is
 *       still being typed answers immediately and never reaches the database.
 */
export type WorkshopAdminCommentSample = {
    readonly occurredAt: string;
    readonly body: string;
};

export type WorkshopAdminAnalytics = {
    readonly timelineStartsAt: string;
    readonly timelineEndsAt: string;
    readonly bucketDurationSeconds: number;
    readonly timeline: readonly WorkshopAdminTimelinePoint[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly commentSamples: readonly WorkshopAdminCommentSample[];

    /**
     * Whether every message of the room could be sampled, or the oldest ones had to be left out of a very busy room
     */
    readonly isCommentSampleComplete: boolean;
};

export type WorkshopContentBlock = {
    readonly id: string;
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;

    /**
     * The one ordinary material selected to lead the post-workshop follow-up.
     */
    readonly isFollowUp: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly linkClickCount: number;
};

/**
 * A participant's progressively saved reflection after one workshop.
 *
 * The score creates the record; every written answer is optional and can then arrive independently, so somebody who
 * only answers the first question is still represented faithfully.
 */
export type WorkshopFeedback = {
    readonly rating: number;
    readonly whatWasGood: string | null;
    readonly whatWasBad: string | null;
    readonly note: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

/**
 * The admin-only form of feedback, attributable to its participant and joinable to the private contact projection.
 */
export type WorkshopAdminFeedback = WorkshopFeedback &
    AdminContactJoin & {
        readonly id: string;
        readonly participantId: string;
        readonly fullname: string;
        readonly email: string;
    };

/**
 * Who wrote a message, as far as somebody moderating the room may know them
 *
 * Note: Only a moderator receives this, so an ordinary participant never learns which invisible moderation state the
 *       author of a message carries, nor the identity behind their name.
 */
export type WorkshopCommentAuthor = {
    readonly participantId: string;
    readonly isTrusted: boolean;
    readonly isInteractionBanned: boolean;
    readonly isModerator: boolean;
};

export type WorkshopComment = {
    readonly id: string;
    readonly authorName: string;
    readonly body: string;
    readonly status: WorkshopCommentStatus;
    readonly upvoteCount: number;
    readonly isUpvotedByParticipant: boolean;
    readonly createdAt: string;

    /**
     * Whether a moderator of the room wrote this message, which the whole room sees on it
     */
    readonly isAuthorModerator: boolean;

    /**
     * The author as a moderator of the room may act on them, or `null` for everybody else
     */
    readonly moderatedAuthor: WorkshopCommentAuthor | null;

    /**
     * The comment this one answers, or `null` when it opens its own thread
     */
    readonly parentCommentId: string | null;

    /**
     * Whether an admin pinned this message to the top of the chat
     *
     * Note: A room has at most one pinned message, because the pin is remembered by the workshop itself.
     */
    readonly isPinned: boolean;
};

/**
 * A comment together with the answers it received
 *
 * Note: The chat is exactly one level deep, so a reply never carries replies of its own.
 */
export type WorkshopCommentThread = {
    readonly comment: WorkshopComment;
    readonly replies: readonly WorkshopComment[];
};

export type WorkshopReaction = {
    readonly id: string;
    readonly emoji: string;
    readonly createdAt: string;
};

/**
 * The number of times one exact reaction has been sent in a workshop
 *
 * Note: This counts reaction actions, rather than distinct people. A participant who reacts twice therefore adds two
 *       to the total, exactly as the room celebrated two reactions.
 */
export type WorkshopReactionCount = {
    readonly emoji: string;
    readonly count: number;
};

/**
 * One answer a member can choose in a poll. The room only receives aggregate counts and whether its own participant
 * chose this option, never the identities behind any other vote.
 */
export type WorkshopPollOption = {
    readonly id: string;
    readonly label: string;
    readonly sortOrder: number;
    readonly voteCount: number;
    readonly isVotedByParticipant: boolean;
};

/**
 * A community question prepared by an administrator. Poll infrastructure is shared with the room model, while the
 * room-kind capability decides which kinds offer it.
 */
export type WorkshopPoll = {
    readonly id: string;
    readonly question: string;
    readonly isClosed: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly options: readonly WorkshopPollOption[];
};

/**
 * One project, prototype, or other creation shared by a community member. The room deliberately carries no e-mail or
 * participant ID with it; only the administration can join that private identity when it needs to moderate a post.
 */
export type WorkshopProject = {
    readonly id: string;
    readonly authorName: string;
    readonly title: string;
    readonly description: string;
    readonly url: string | null;
    readonly status: WorkshopProjectStatus;
    readonly createdAt: string;
    readonly updatedAt: string;

    /**
     * A member may see their own pending or rejected project, while other members receive approved projects only.
     */
    readonly isAuthoredByParticipant: boolean;
};

export type WorkshopPublicState = {
    readonly serverTime: string;
    readonly workshop: WorkshopDetails;
    readonly participant: WorkshopParticipant;

    /**
     * How many participants had the room open recently, including the one this state was loaded for
     */
    readonly watchingParticipantCount: number;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
    readonly feedback: WorkshopFeedback | null;
    readonly comments: readonly WorkshopComment[];
    readonly recentReactions: readonly WorkshopReaction[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly polls: readonly WorkshopPoll[];
    readonly projects: readonly WorkshopProject[];
};

/**
 * As much of an answered comment as the moderation of a reply needs to judge it
 */
export type WorkshopCommentReference = {
    readonly id: string;
    readonly authorName: string;
    readonly body: string;
};

export type WorkshopAdminComment = Omit<WorkshopComment, 'isUpvotedByParticipant'> & {
    readonly participantId: string | null;
    readonly isArtificial: boolean;
    readonly realUpvoteCount: number;
    readonly artificialUpvoteCount: number;
    readonly parentComment: WorkshopCommentReference | null;
};

/**
 * The administrator's form of a shared project, where its author can be traced to the participant record without
 * exposing that identifier in the public room response.
 */
export type WorkshopAdminProject = Omit<WorkshopProject, 'isAuthoredByParticipant'> & {
    readonly participantId: string;
};

export type WorkshopAdminSnapshot = {
    readonly workshop: WorkshopDetails;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly polls: readonly WorkshopPoll[];
    readonly projects: readonly WorkshopAdminProject[];
    readonly comments: readonly WorkshopAdminComment[];

    /**
     * The message pinned on top of the chat, whatever moderation state the administration is listing
     */
    readonly pinnedComment: WorkshopCommentReference | null;
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly participantCount: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly artificialReactionCount: number;
};

export type WorkshopRealtimeEvent =
    | { readonly kind: 'state-changed' }
    | { readonly kind: 'reaction'; readonly reaction: WorkshopReaction; readonly reactionCount: number }
    | { readonly kind: 'upvote'; readonly commentId: string; readonly upvoteCount: number };
