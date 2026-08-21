import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';

export type WorkshopCommentStatus = 'pending' | 'approved' | 'rejected';
export type WorkshopCommentSort = 'recent' | 'upvotes';

export type WorkshopSummary = {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly isPublished: boolean;
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
    readonly connectedAt: string;
    readonly isInteractionBanned: boolean;
    readonly isTrusted: boolean;
};

export type WorkshopAdminParticipant = WorkshopParticipant & {
    readonly email: string;
    readonly lastSeenAt: string;
    readonly activeDurationSeconds: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly linkClickCount: number;
    readonly upvoteCount: number;
};

export type WorkshopContentBlock = {
    readonly id: string;
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly linkClickCount: number;
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
    readonly comments: readonly WorkshopComment[];
    readonly recentReactions: readonly WorkshopReaction[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
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

export type WorkshopAdminSnapshot = {
    readonly workshop: WorkshopDetails;
    readonly contentBlocks: readonly WorkshopContentBlock[];
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
