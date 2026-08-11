import { requestJson, sendJson } from '@/lib/api/requestJson';
import {
    WORKSHOP_ID_PARAMETER_NAME,
    WORKSHOP_MESSAGES_API_PATH,
    WORKSHOP_REACTIONS_API_PATH,
    WORKSHOP_STATE_API_PATH,
} from '@/lib/workshop/workshopConfig';
import type { WorkshopParticipantIdentity, WorkshopState } from '@/lib/workshop/workshopTypes';

/**
 * Build the url of a workshop endpoint asking about one concrete workshop
 */
function buildWorkshopApiUrl(apiPath: string, workshopId: string): string {
    const searchParams = new URLSearchParams({ [WORKSHOP_ID_PARAMETER_NAME]: workshopId });

    return `${apiPath}?${searchParams.toString()}`;
}

/**
 * Ask what a participant may see right now
 */
export async function fetchWorkshopState(workshopId: string, abortSignal?: AbortSignal): Promise<WorkshopState> {
    return requestJson<WorkshopState>(buildWorkshopApiUrl(WORKSHOP_STATE_API_PATH, workshopId), {
        signal: abortSignal,
        cache: 'no-store',
    });
}

/**
 * Send one message into the live chat
 */
export async function sendChatMessage(
    workshopId: string,
    participantIdentity: WorkshopParticipantIdentity,
    messageText: string,
): Promise<void> {
    await sendJson(buildWorkshopApiUrl(WORKSHOP_MESSAGES_API_PATH, workshopId), 'POST', {
        ...participantIdentity,
        messageText,
    });
}

/**
 * Send one reaction
 */
export async function sendReaction(
    workshopId: string,
    participantIdentity: WorkshopParticipantIdentity,
    reactionEmoji: string,
): Promise<void> {
    await sendJson(buildWorkshopApiUrl(WORKSHOP_REACTIONS_API_PATH, workshopId), 'POST', {
        participantId: participantIdentity.participantId,
        reactionEmoji,
    });
}
