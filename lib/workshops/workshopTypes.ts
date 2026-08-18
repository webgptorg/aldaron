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
};

export type WorkshopReaction = {
    readonly id: string;
    readonly emoji: string;
    readonly createdAt: string;
};

export type WorkshopPublicState = {
    readonly serverTime: string;
    readonly workshop: WorkshopDetails;
    readonly participant: WorkshopParticipant;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
    readonly comments: readonly WorkshopComment[];
    readonly recentReactions: readonly WorkshopReaction[];
};

export type WorkshopAdminComment = Omit<WorkshopComment, 'isUpvotedByParticipant'> & {
    readonly participantId: string | null;
    readonly isArtificial: boolean;
    readonly realUpvoteCount: number;
    readonly artificialUpvoteCount: number;
};

export type WorkshopAdminSnapshot = {
    readonly workshop: WorkshopDetails;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly comments: readonly WorkshopAdminComment[];
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly participantCount: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly artificialReactionCount: number;
};

export type WorkshopRealtimeEvent =
    | { readonly kind: 'state-changed' }
    | { readonly kind: 'reaction'; readonly reaction: WorkshopReaction }
    | { readonly kind: 'upvote'; readonly commentId: string; readonly upvoteCount: number };
