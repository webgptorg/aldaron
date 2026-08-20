/**
 * What the chat still offers to one participant
 *
 * Note: Both the switch of the whole panel and the ban of a single participant end here, so every part of the chat
 *       asks one answer instead of judging the two of them again.
 */
export type WorkshopChatInteractivity = {
    /**
     * Whether the chat offers writing a message or an answer
     */
    readonly isWritingOffered: boolean;

    /**
     * Whether the chat offers voting for a message
     */
    readonly isUpvotingOffered: boolean;
};

type WorkshopChatInteractivityInput = {
    readonly isChatEnabled: boolean;
    readonly isInteractionBanned: boolean;
};

/**
 * Note: A banned participant keeps the form, because they must not learn about their ban. Their messages are rejected
 *       on the way in, while a switched-off chat takes the form away from the whole room.
 */
export function getWorkshopChatInteractivity({
    isChatEnabled,
    isInteractionBanned,
}: WorkshopChatInteractivityInput): WorkshopChatInteractivity {
    return {
        isWritingOffered: isChatEnabled,
        isUpvotingOffered: isChatEnabled && !isInteractionBanned,
    };
}
