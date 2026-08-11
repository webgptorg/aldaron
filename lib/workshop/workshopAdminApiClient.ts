import { buildAdminApiUrl } from '@/lib/admin/buildAdminApiUrl';
import { requestJson, sendJson } from '@/lib/api/requestJson';
import {
    WORKSHOP_CONTENT_API_PATH,
    WORKSHOP_ID_PARAMETER_NAME,
    WORKSHOP_MESSAGES_API_PATH,
    WORKSHOP_SETTINGS_API_PATH,
} from '@/lib/workshop/workshopConfig';
import type {
    WorkshopChatMessage,
    WorkshopChatMessageChanges,
    WorkshopContentBlock,
    WorkshopContentBlockChanges,
    WorkshopContentBlockDraft,
    WorkshopSettings,
    WorkshopSettingsChanges,
} from '@/lib/workshop/workshopTypes';

/**
 * Build the url of a workshop endpoint with the admin token and the workshop it is asked about
 */
function buildWorkshopAdminApiUrl(
    apiPath: string,
    adminToken: string | null,
    workshopId: string,
    additionalParams: Readonly<Record<string, string>> = {},
): string {
    return buildAdminApiUrl(apiPath, adminToken, {
        [WORKSHOP_ID_PARAMETER_NAME]: workshopId,
        ...additionalParams,
    });
}

/**
 * Read the settings the workshop currently runs on
 */
export async function fetchWorkshopSettingsAsAdmin(
    adminToken: string | null,
    workshopId: string,
): Promise<WorkshopSettings> {
    const { settings } = await requestJson<{ settings: WorkshopSettings }>(
        buildWorkshopAdminApiUrl(WORKSHOP_SETTINGS_API_PATH, adminToken, workshopId),
    );

    return settings;
}

/**
 * Save the changed settings of the workshop
 */
export async function saveWorkshopSettingsAsAdmin(
    adminToken: string | null,
    workshopId: string,
    settingsChanges: WorkshopSettingsChanges,
): Promise<WorkshopSettings> {
    const { settings } = await sendJson<{ settings: WorkshopSettings }>(
        buildWorkshopAdminApiUrl(WORKSHOP_SETTINGS_API_PATH, adminToken, workshopId),
        'PATCH',
        settingsChanges,
    );

    return settings;
}

/**
 * Read every content block, the drafts and the still locked ones included
 */
export async function fetchContentBlocksAsAdmin(
    adminToken: string | null,
    workshopId: string,
): Promise<readonly WorkshopContentBlock[]> {
    const { contentBlocks } = await requestJson<{ contentBlocks: readonly WorkshopContentBlock[] }>(
        buildWorkshopAdminApiUrl(WORKSHOP_CONTENT_API_PATH, adminToken, workshopId),
    );

    return contentBlocks;
}

/**
 * Add one content block
 */
export async function createContentBlockAsAdmin(
    adminToken: string | null,
    workshopId: string,
    contentBlockDraft: WorkshopContentBlockDraft,
): Promise<WorkshopContentBlock> {
    const { contentBlock } = await sendJson<{ contentBlock: WorkshopContentBlock }>(
        buildWorkshopAdminApiUrl(WORKSHOP_CONTENT_API_PATH, adminToken, workshopId),
        'POST',
        contentBlockDraft,
    );

    return contentBlock;
}

/**
 * Change one content block, which reaches every connected participant with their next poll
 */
export async function updateContentBlockAsAdmin(
    adminToken: string | null,
    workshopId: string,
    contentBlockId: number,
    contentBlockChanges: WorkshopContentBlockChanges,
): Promise<WorkshopContentBlock> {
    const { contentBlock } = await sendJson<{ contentBlock: WorkshopContentBlock }>(
        buildWorkshopAdminApiUrl(WORKSHOP_CONTENT_API_PATH, adminToken, workshopId),
        'PATCH',
        { id: contentBlockId, ...contentBlockChanges },
    );

    return contentBlock;
}

/**
 * Remove one content block
 */
export async function deleteContentBlockAsAdmin(
    adminToken: string | null,
    workshopId: string,
    contentBlockId: number,
): Promise<void> {
    await sendJson(buildWorkshopAdminApiUrl(WORKSHOP_CONTENT_API_PATH, adminToken, workshopId), 'DELETE', {
        id: contentBlockId,
    });
}

/**
 * Read the chat including the messages which the moderation already took away
 */
export async function fetchChatMessagesAsAdmin(
    adminToken: string | null,
    workshopId: string,
): Promise<readonly WorkshopChatMessage[]> {
    const { chatMessages } = await requestJson<{ chatMessages: readonly WorkshopChatMessage[] }>(
        buildWorkshopAdminApiUrl(WORKSHOP_MESSAGES_API_PATH, adminToken, workshopId, { showAll: 'true' }),
    );

    return chatMessages;
}

/**
 * Take one message away from the participants, or give it back
 */
export async function updateChatMessageAsAdmin(
    adminToken: string | null,
    workshopId: string,
    chatMessageId: number,
    chatMessageChanges: WorkshopChatMessageChanges,
): Promise<WorkshopChatMessage> {
    const { chatMessage } = await sendJson<{ chatMessage: WorkshopChatMessage }>(
        buildWorkshopAdminApiUrl(WORKSHOP_MESSAGES_API_PATH, adminToken, workshopId),
        'PATCH',
        { id: chatMessageId, ...chatMessageChanges },
    );

    return chatMessage;
}

/**
 * Remove one message for good
 */
export async function deleteChatMessageAsAdmin(
    adminToken: string | null,
    workshopId: string,
    chatMessageId: number,
): Promise<void> {
    await sendJson(buildWorkshopAdminApiUrl(WORKSHOP_MESSAGES_API_PATH, adminToken, workshopId), 'DELETE', {
        id: chatMessageId,
    });
}
