/**
 * Settings of one workshop as stored in the `WorkshopSettings` table
 *
 * Note: There is exactly one row per `workshopId`, it is what the administration edits and what decides when the
 *       countdown ends and which stream is shown.
 */
export type WorkshopSettings = {
    readonly workshopId: string;

    /**
     * Headline shown above the countdown and the stream
     */
    readonly title: string;

    /**
     * Moment the workshop starts, which is the moment the countdown reaches zero
     */
    readonly startsAt: string;

    /**
     * Id of the YouTube video which carries the live stream, for example `dQw4w9WgXcQ`
     */
    readonly youtubeVideoId: string | null;

    /**
     * Whether the stream is shown even before the countdown reaches zero
     *
     * Note: It is the manual override for the moment the stream starts a bit earlier or the start has to be delayed.
     */
    readonly isStreamLive: boolean;

    /**
     * Short note shown next to the stream, for example an apology for a delayed start
     */
    readonly streamNote: string | null;

    /**
     * Whether the participants may write into the chat
     */
    readonly isChatEnabled: boolean;
};

/**
 * Fields of the settings which the administration may change
 */
export type WorkshopSettingsChanges = Partial<Omit<WorkshopSettings, 'workshopId'>>;

/**
 * One piece of the workshop content, written in Markdown and revealed at its own moment
 *
 * Note: The unlocking is decided by `unlockedAt` alone, so a block can be revealed during the workshop as well as
 *       days after it.
 */
export type WorkshopContentBlock = {
    readonly id: number;
    readonly workshopId: string;
    readonly createdAt: string | null;

    /**
     * Headline of the block, shown above the rendered Markdown
     */
    readonly title: string;

    /**
     * Body of the block written in Markdown
     */
    readonly contentMarkdown: string;

    /**
     * Moment from which the participants see the block, or `null` while it is still only a draft
     */
    readonly unlockedAt: string | null;

    /**
     * Position of the block among the other blocks, the lower the earlier
     */
    readonly sortOrder: number;
};

/**
 * Values needed to create one content block
 */
export type WorkshopContentBlockDraft = {
    readonly title: string;
    readonly contentMarkdown: string;
    readonly unlockedAt: string | null;
    readonly sortOrder: number;
};

/**
 * Fields of an existing content block which the administration may change
 */
export type WorkshopContentBlockChanges = Partial<WorkshopContentBlockDraft>;

/**
 * One message of the live chat
 */
export type WorkshopChatMessage = {
    readonly id: number;
    readonly workshopId: string;
    readonly createdAt: string | null;

    /**
     * Name the participant filled in before joining
     */
    readonly participantName: string;

    /**
     * Identifier the browser of the participant generated, which tells the own messages from the others
     */
    readonly participantId: string | null;

    /**
     * Text of the message
     */
    readonly messageText: string;

    /**
     * Whether the message was hidden by the moderation and is no longer shown to the participants
     */
    readonly isHidden: boolean;
};

/**
 * Fields of an existing chat message which the moderation may change
 */
export type WorkshopChatMessageChanges = {
    readonly isHidden?: boolean;
};

/**
 * One reaction sent by a participant
 */
export type WorkshopReaction = {
    readonly id: number;
    readonly workshopId: string;
    readonly createdAt: string | null;
    readonly participantId: string | null;
    readonly reactionEmoji: string;
};

/**
 * How many times one emoji was sent, and how many of those are fresh enough to be worth animating
 */
export type WorkshopReactionSummary = {
    readonly reactionEmoji: string;
    readonly totalCount: number;
    readonly recentCount: number;
};

/**
 * Everything one participant may see at this very moment
 *
 * Note: It is answered by a single endpoint, so the page needs one poll to stay current in all of its parts.
 */
export type WorkshopState = {
    /**
     * Moment the answer was built, used to keep the countdown right even when the clock of the participant is off
     */
    readonly serverTime: string;

    readonly settings: WorkshopSettings;

    /**
     * Only the blocks which are already unlocked, the locked ones never leave the server
     */
    readonly contentBlocks: readonly WorkshopContentBlock[];

    /**
     * The newest messages of the chat, oldest first, without the hidden ones
     */
    readonly chatMessages: readonly WorkshopChatMessage[];

    readonly reactions: readonly WorkshopReactionSummary[];
};

/**
 * Who is sending a message or a reaction
 */
export type WorkshopParticipantIdentity = {
    readonly participantName: string;
    readonly participantId: string;
};
