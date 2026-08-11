import { MAXIMAL_SHOWN_CHAT_MESSAGES_COUNT, WORKSHOP_CHAT_MESSAGE_TABLE_NAME } from '@/lib/workshop/workshopConfig';
import { assertQuerySucceeded, getWorkshopDatabase } from '@/lib/workshop/workshopDatabase';
import type {
    WorkshopChatMessage,
    WorkshopChatMessageChanges,
    WorkshopParticipantIdentity,
} from '@/lib/workshop/workshopTypes';

/**
 * The newest messages of the chat, oldest first
 *
 * @param isShowingHidden Whether the messages taken away by the moderation are listed as well, which only the
 *                        administration is allowed to ask for
 */
export async function fetchChatMessages(
    workshopId: string,
    { isShowingHidden }: { isShowingHidden: boolean },
): Promise<readonly WorkshopChatMessage[]> {
    let query = getWorkshopDatabase()
        .from(WORKSHOP_CHAT_MESSAGE_TABLE_NAME)
        .select('*')
        .eq('workshopId', workshopId);

    if (!isShowingHidden) {
        query = query.eq('isHidden', false);
    }

    // Note: The newest messages are the interesting ones, but the chat reads from the oldest, so the window taken
    //       from the end of the conversation is turned around again
    const { data, error } = await query.order('id', { ascending: false }).limit(MAXIMAL_SHOWN_CHAT_MESSAGES_COUNT);

    assertQuerySucceeded(error);

    return ((data || []) as readonly WorkshopChatMessage[]).slice().reverse();
}

/**
 * Write one message of a participant into the chat
 */
export async function createChatMessage(
    workshopId: string,
    { participantName, participantId }: WorkshopParticipantIdentity,
    messageText: string,
): Promise<WorkshopChatMessage> {
    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_CHAT_MESSAGE_TABLE_NAME)
        // Note: A request which carries no identifier is stored without one, so that two such messages never look
        //       like they came from the same browser
        .insert({ workshopId, participantName, participantId: participantId || null, messageText, isHidden: false })
        .select()
        .single();

    assertQuerySucceeded(error);

    return data as WorkshopChatMessage;
}

/**
 * Take one message away from the participants, or give it back
 */
export async function updateChatMessage(
    chatMessageId: number,
    chatMessageChanges: WorkshopChatMessageChanges,
): Promise<WorkshopChatMessage> {
    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_CHAT_MESSAGE_TABLE_NAME)
        .update(chatMessageChanges)
        .eq('id', chatMessageId)
        .select()
        .single();

    assertQuerySucceeded(error);

    return data as WorkshopChatMessage;
}

/**
 * Remove one message for good
 */
export async function deleteChatMessage(chatMessageId: number): Promise<void> {
    const { error } = await getWorkshopDatabase()
        .from(WORKSHOP_CHAT_MESSAGE_TABLE_NAME)
        .delete()
        .eq('id', chatMessageId);

    assertQuerySucceeded(error);
}
