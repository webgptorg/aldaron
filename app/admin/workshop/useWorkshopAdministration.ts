'use client';

import { ONLINE_WORKSHOP_ID } from '@/businesses/online-workshop/config';
import { WORKSHOP_POLLING_INTERVAL_MS } from '@/lib/workshop/workshopConfig';
import {
    createContentBlockAsAdmin,
    deleteChatMessageAsAdmin,
    deleteContentBlockAsAdmin,
    fetchChatMessagesAsAdmin,
    fetchContentBlocksAsAdmin,
    fetchWorkshopSettingsAsAdmin,
    saveWorkshopSettingsAsAdmin,
    updateChatMessageAsAdmin,
    updateContentBlockAsAdmin,
} from '@/lib/workshop/workshopAdminApiClient';
import type {
    WorkshopChatMessage,
    WorkshopChatMessageChanges,
    WorkshopContentBlock,
    WorkshopContentBlockChanges,
    WorkshopContentBlockDraft,
    WorkshopSettings,
    WorkshopSettingsChanges,
} from '@/lib/workshop/workshopTypes';
import { useCallback, useEffect, useState } from 'react';

/**
 * How often the moderation sees the newly written messages
 *
 * Note: The chat is the only part of the administration which changes on its own, everything else changes only when
 *       the organizers change it.
 */
const CHAT_MODERATION_REFRESH_INTERVAL_MS = 2 * WORKSHOP_POLLING_INTERVAL_MS;

type UseWorkshopAdministrationResult = {
    readonly settings: WorkshopSettings | null;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly chatMessages: readonly WorkshopChatMessage[];

    readonly isLoading: boolean;
    readonly errorMessage: string | null;

    readonly saveSettings: (settingsChanges: WorkshopSettingsChanges) => Promise<boolean>;
    readonly addContentBlock: (contentBlockDraft: WorkshopContentBlockDraft) => Promise<boolean>;
    readonly changeContentBlock: (
        contentBlockId: number,
        contentBlockChanges: WorkshopContentBlockChanges,
    ) => Promise<boolean>;
    readonly removeContentBlock: (contentBlockId: number) => Promise<boolean>;
    readonly changeChatMessage: (
        chatMessageId: number,
        chatMessageChanges: WorkshopChatMessageChanges,
    ) => Promise<boolean>;
    readonly removeChatMessage: (chatMessageId: number) => Promise<boolean>;
};

/**
 * Everything the administration of the workshop reads and writes
 *
 * Note: The whole dashboard talks to the server only through this one hook, so the admin token travels through a
 *       single place.
 */
export function useWorkshopAdministration(adminToken: string | null): UseWorkshopAdministrationResult {
    const workshopId = ONLINE_WORKSHOP_ID;

    const [settings, setSettings] = useState<WorkshopSettings | null>(null);
    const [contentBlocks, setContentBlocks] = useState<readonly WorkshopContentBlock[]>([]);
    const [chatMessages, setChatMessages] = useState<readonly WorkshopChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * Run one change against the server and report whether it went through
     */
    const runOperation = useCallback(async (operation: () => Promise<void>): Promise<boolean> => {
        try {
            await operation();
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        }
    }, []);

    useEffect(() => {
        let isLoadingActive = true;
        setIsLoading(true);

        Promise.all([
            fetchWorkshopSettingsAsAdmin(adminToken, workshopId),
            fetchContentBlocksAsAdmin(adminToken, workshopId),
            fetchChatMessagesAsAdmin(adminToken, workshopId),
        ])
            .then(([loadedSettings, loadedContentBlocks, loadedChatMessages]) => {
                if (!isLoadingActive) {
                    return;
                }

                setSettings(loadedSettings);
                setContentBlocks(loadedContentBlocks);
                setChatMessages(loadedChatMessages);
                setErrorMessage(null);
            })
            .catch((error: Error) => {
                if (isLoadingActive) {
                    setErrorMessage(error.message);
                }
            })
            .finally(() => {
                if (isLoadingActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isLoadingActive = false;
        };
    }, [adminToken, workshopId]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchChatMessagesAsAdmin(adminToken, workshopId)
                .then(setChatMessages)
                .catch((error: Error) => console.warn('Failed to refresh the chat', error));
        }, CHAT_MODERATION_REFRESH_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [adminToken, workshopId]);

    const saveSettings = useCallback(
        (settingsChanges: WorkshopSettingsChanges) =>
            runOperation(async () => {
                setSettings(await saveWorkshopSettingsAsAdmin(adminToken, workshopId, settingsChanges));
            }),
        [adminToken, runOperation, workshopId],
    );

    const addContentBlock = useCallback(
        (contentBlockDraft: WorkshopContentBlockDraft) =>
            runOperation(async () => {
                const addedContentBlock = await createContentBlockAsAdmin(adminToken, workshopId, contentBlockDraft);

                setContentBlocks((previousContentBlocks) => [...previousContentBlocks, addedContentBlock]);
            }),
        [adminToken, runOperation, workshopId],
    );

    const changeContentBlock = useCallback(
        (contentBlockId: number, contentBlockChanges: WorkshopContentBlockChanges) =>
            runOperation(async () => {
                const changedContentBlock = await updateContentBlockAsAdmin(
                    adminToken,
                    workshopId,
                    contentBlockId,
                    contentBlockChanges,
                );

                setContentBlocks((previousContentBlocks) =>
                    previousContentBlocks.map((contentBlock) =>
                        contentBlock.id === contentBlockId ? changedContentBlock : contentBlock,
                    ),
                );
            }),
        [adminToken, runOperation, workshopId],
    );

    const removeContentBlock = useCallback(
        (contentBlockId: number) =>
            runOperation(async () => {
                await deleteContentBlockAsAdmin(adminToken, workshopId, contentBlockId);

                setContentBlocks((previousContentBlocks) =>
                    previousContentBlocks.filter((contentBlock) => contentBlock.id !== contentBlockId),
                );
            }),
        [adminToken, runOperation, workshopId],
    );

    const changeChatMessage = useCallback(
        (chatMessageId: number, chatMessageChanges: WorkshopChatMessageChanges) =>
            runOperation(async () => {
                const changedChatMessage = await updateChatMessageAsAdmin(
                    adminToken,
                    workshopId,
                    chatMessageId,
                    chatMessageChanges,
                );

                setChatMessages((previousChatMessages) =>
                    previousChatMessages.map((chatMessage) =>
                        chatMessage.id === chatMessageId ? changedChatMessage : chatMessage,
                    ),
                );
            }),
        [adminToken, runOperation, workshopId],
    );

    const removeChatMessage = useCallback(
        (chatMessageId: number) =>
            runOperation(async () => {
                await deleteChatMessageAsAdmin(adminToken, workshopId, chatMessageId);

                setChatMessages((previousChatMessages) =>
                    previousChatMessages.filter((chatMessage) => chatMessage.id !== chatMessageId),
                );
            }),
        [adminToken, runOperation, workshopId],
    );

    return {
        settings,
        contentBlocks,
        chatMessages,
        isLoading,
        errorMessage,
        saveSettings,
        addContentBlock,
        changeContentBlock,
        removeContentBlock,
        changeChatMessage,
        removeChatMessage,
    };
}
