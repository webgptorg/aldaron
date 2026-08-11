'use client';

import { fetchWorkshopState, sendChatMessage, sendReaction } from '@/lib/workshop/workshopApiClient';
import { WORKSHOP_POLLING_INTERVAL_MS } from '@/lib/workshop/workshopConfig';
import type { WorkshopParticipantIdentity, WorkshopState } from '@/lib/workshop/workshopTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseWorkshopStateResult = {
    /**
     * What the participant may see right now, `null` until the first answer arrives
     */
    readonly workshopState: WorkshopState | null;

    readonly isLoading: boolean;
    readonly errorMessage: string | null;

    /**
     * How much the clock of the server is ahead of the clock of this browser
     *
     * Note: The countdown is built on the clock of the server, so a participant with a badly set computer still sees
     *       the stream start at the right moment.
     */
    readonly serverTimeOffsetMs: number;

    /**
     * Ask the server what is new right now, without waiting for the next round
     */
    readonly refreshWorkshopState: () => void;

    readonly sendMessageToChat: (messageText: string) => Promise<boolean>;
    readonly sendReactionEmoji: (reactionEmoji: string) => Promise<void>;
};

/**
 * Keep the page of a participant on the current version of the workshop
 *
 * Note: Everything the page shows comes from one repeated question, so a content block which is unlocked or removed
 *       during the workshop reaches an already connected participant within one round.
 */
export function useWorkshopState(
    workshopId: string,
    participantIdentity: WorkshopParticipantIdentity | null,
): UseWorkshopStateResult {
    const [workshopState, setWorkshopState] = useState<WorkshopState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);

    const refreshWorkshopStateRef = useRef<() => void>(() => {});

    useEffect(() => {
        let isPollingActive = true;
        let nextRoundTimeoutId: ReturnType<typeof setTimeout> | undefined;

        const scheduleNextRound = () => {
            if (!isPollingActive) {
                return;
            }

            nextRoundTimeoutId = setTimeout(askWhatIsNew, WORKSHOP_POLLING_INTERVAL_MS);
        };

        async function askWhatIsNew() {
            clearTimeout(nextRoundTimeoutId);

            // Note: A participant who switched to another tab is not watching anyway, so the server is left alone
            //       until they come back
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                scheduleNextRound();
                return;
            }

            try {
                const loadedWorkshopState = await fetchWorkshopState(workshopId);

                if (!isPollingActive) {
                    return;
                }

                setWorkshopState(loadedWorkshopState);
                setServerTimeOffsetMs(new Date(loadedWorkshopState.serverTime).getTime() - Date.now());
                setErrorMessage(null);
            } catch (error) {
                if (isPollingActive) {
                    setErrorMessage((error as Error).message);
                }
            } finally {
                if (isPollingActive) {
                    setIsLoading(false);
                    scheduleNextRound();
                }
            }
        }

        refreshWorkshopStateRef.current = () => {
            //* not await */ askWhatIsNew();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                //* not await */ askWhatIsNew();
            }
        };

        //* not await */ askWhatIsNew();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isPollingActive = false;
            clearTimeout(nextRoundTimeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [workshopId]);

    const refreshWorkshopState = useCallback(() => refreshWorkshopStateRef.current(), []);

    const sendMessageToChat = useCallback(
        async (messageText: string): Promise<boolean> => {
            if (participantIdentity === null) {
                return false;
            }

            try {
                await sendChatMessage(workshopId, participantIdentity, messageText);
                setErrorMessage(null);
                refreshWorkshopState();
                return true;
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [participantIdentity, refreshWorkshopState, workshopId],
    );

    const sendReactionEmoji = useCallback(
        async (reactionEmoji: string): Promise<void> => {
            if (participantIdentity === null) {
                return;
            }

            try {
                await sendReaction(workshopId, participantIdentity, reactionEmoji);
            } catch (error) {
                console.warn('Failed to send the reaction', error);
            }
        },
        [participantIdentity, workshopId],
    );

    return {
        workshopState,
        isLoading,
        errorMessage,
        serverTimeOffsetMs,
        refreshWorkshopState,
        sendMessageToChat,
        sendReactionEmoji,
    };
}
