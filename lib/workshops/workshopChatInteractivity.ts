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

    /**
     * Whether the chat offers moderating a message and its author
     */
    readonly isModerationOffered: boolean;
};

type WorkshopChatInteractivityInput = {
    readonly isChatEnabled: boolean;
    readonly isInteractionBanned: boolean;

    /**
     * Whether this participant moderates the room, see `isWorkshopParticipantModerating`
     */
    readonly isModerating: boolean;
};

/**
 * Note: A banned participant keeps the form, because they must not learn about their ban. Their messages are rejected
 *       on the way in, while a switched-off chat takes the form away from the whole room.
 * Note: A switched-off chat is switched off for the participants of the room. A moderator keeps moderating it, exactly
 *       as the administration keeps moderating a room whose panels are switched off.
 */
export function getWorkshopChatInteractivity({
    isChatEnabled,
    isInteractionBanned,
    isModerating,
}: WorkshopChatInteractivityInput): WorkshopChatInteractivity {
    return {
        isWritingOffered: isChatEnabled,
        isUpvotingOffered: isChatEnabled && !isInteractionBanned,
        isModerationOffered: isModerating,
    };
}
