import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getFallbackWorkshopSettings, readWorkshopIdFromRequest } from '@/lib/workshop/servedWorkshop';
import {
    createChatMessage,
    deleteChatMessage,
    fetchChatMessages,
    updateChatMessage,
} from '@/lib/workshop/workshopChatMessagesRepository';
import { createWorkshopApiError } from '@/lib/workshop/workshopApiError';
import { createWorkshopApiErrorResponse } from '@/lib/workshop/workshopApiErrorResponse';
import { MAXIMAL_CHAT_MESSAGE_LENGTH, MAXIMAL_PARTICIPANT_NAME_LENGTH } from '@/lib/workshop/workshopConfig';
import { fetchWorkshopSettings } from '@/lib/workshop/workshopSettingsRepository';
import { readOptionalBoolean, readRequiredText, readRowId, readText } from '@/lib/workshop/workshopValidation';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * The whole chat including the messages the moderation took away, only for the administration
 */
export async function GET(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const chatMessages = await fetchChatMessages(readWorkshopIdFromRequest(request), { isShowingHidden: true });

        return NextResponse.json({ chatMessages });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Write one message of a participant into the chat
 */
export async function POST(request: Request) {
    try {
        const workshopId = readWorkshopIdFromRequest(request);
        const body = (await request.json()) as Record<string, unknown>;

        const settings = await fetchWorkshopSettings(workshopId, getFallbackWorkshopSettings(workshopId));

        if (!settings.isChatEnabled) {
            throw createWorkshopApiError('The chat of this workshop is closed', 403);
        }

        const chatMessage = await createChatMessage(
            workshopId,
            {
                participantName: readRequiredText(
                    body.participantName,
                    MAXIMAL_PARTICIPANT_NAME_LENGTH,
                    'participantName',
                ),
                participantId: readText(body.participantId, MAXIMAL_PARTICIPANT_NAME_LENGTH),
            },
            readRequiredText(body.messageText, MAXIMAL_CHAT_MESSAGE_LENGTH, 'messageText'),
        );

        return NextResponse.json({ chatMessage });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Take one message away from the participants, or give it back
 */
export async function PATCH(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const body = (await request.json()) as Record<string, unknown>;
        const isHidden = readOptionalBoolean(body.isHidden, 'isHidden');

        if (isHidden === undefined) {
            throw createWorkshopApiError('There is nothing to change on the message', 400);
        }

        const chatMessage = await updateChatMessage(readRowId(body.id), { isHidden });

        return NextResponse.json({ chatMessage });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Remove one message for good
 */
export async function DELETE(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const body = (await request.json()) as Record<string, unknown>;

        await deleteChatMessage(readRowId(body.id));

        return NextResponse.json({ isDeleted: true });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}
