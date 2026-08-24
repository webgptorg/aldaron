'use client';

import {
    useWorkshopReactionAnimations,
    type SubscribeToWorkshopReactions,
} from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import {
    changeWorkshopParticipantFullname,
    connectToWorkshop,
    fetchWorkshopState,
    moderateWorkshopAuthor,
    moderateWorkshopComment,
    recordWorkshopMaterialLinkClick,
    reportWorkshopPresence,
    saveWorkshopFeedback,
    sendWorkshopReaction,
    submitWorkshopComment,
    upvoteWorkshopComment,
    WorkshopApiError,
    type WorkshopAuthorModerationValues,
    type WorkshopCommentModerationValues,
    type WorkshopCommentValues,
    type WorkshopFeedbackValues,
} from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { getSupabaseForBrowser } from '@/lib/supabase';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import {
    getWorkshopRealtimeTopic,
    MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS,
    WORKSHOP_REALTIME_EVENT_NAME,
} from '@/lib/workshops/workshopConstants';
import {
    getContentUnlockRefreshDelay,
    isWorkshopRealtimeEvent,
} from '@/lib/workshops/workshopClientState';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { sortWorkshopComments } from '@/lib/workshops/workshopCommentValues';
import type { WorkshopCommentSort, WorkshopContentBlock, WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

const DISCONNECTED_REFRESH_MINIMUM_MILLISECONDS = 25_000;
const DISCONNECTED_REFRESH_JITTER_MILLISECONDS = 10_000;
const CONNECTED_REFRESH_MINIMUM_MILLISECONDS = 120_000;
const CONNECTED_REFRESH_JITTER_MILLISECONDS = 30_000;
const REALTIME_INVALIDATION_JITTER_MILLISECONDS = 1_250;
const WORKSHOP_PRESENCE_REPORT_INTERVAL_MILLISECONDS = 30_000;
const NEW_CONTENT_UNLOCK_HIGHLIGHT_DURATION_MILLISECONDS = 8_000;

type WorkshopParticipantController = {
    readonly state: WorkshopPublicState | null;
    readonly commentSort: WorkshopCommentSort;
    readonly isCheckingConnection: boolean;
    readonly isConnectionRequired: boolean;
    readonly isRefreshing: boolean;
    readonly errorMessage: string | null;
    /**
     * Offers the stage the reactions which deserve to fly over it
     */
    readonly subscribeToReactions: SubscribeToWorkshopReactions;
    readonly newlyUnlockedContentBlockIds: ReadonlySet<string>;
    readonly connect: (values: { readonly fullname: string; readonly email: string }) => Promise<boolean>;
    readonly changeFullname: (fullname: string) => Promise<boolean>;
    readonly refresh: () => Promise<boolean>;
    readonly changeCommentSort: (sort: WorkshopCommentSort) => void;
    readonly submitComment: (values: WorkshopCommentValues) => Promise<boolean>;
    readonly upvoteComment: (commentId: string) => Promise<void>;

    /**
     * Moderates one message of the chat, which only a moderator of the room is offered
     */
    readonly moderateComment: (commentId: string, values: WorkshopCommentModerationValues) => Promise<boolean>;

    /**
     * Moderates the author of one message of the chat, which only a moderator of the room is offered
     */
    readonly moderateAuthor: (participantId: string, values: WorkshopAuthorModerationValues) => Promise<boolean>;
    readonly react: (emoji: string) => Promise<void>;
    readonly recordMaterialLinkClick: (contentId: string) => void;

    /**
     * Saves one post-workshop feedback step without waiting for the rest of the form.
     */
    readonly saveFeedback: (values: WorkshopFeedbackValues) => Promise<boolean>;
};

function getCzechApiErrorMessage(error: unknown): string {
    if (!(error instanceof WorkshopApiError)) {
        return 'Spojení se nepovedlo. Zkuste to prosím znovu.';
    }
    if (error.status === 429) {
        return 'Posíláte akce příliš rychle. Zkuste to za chvíli.';
    }
    if (error.status === 400) {
        return 'Odeslané údaje nejsou platné. Zkontrolujte je prosím a zkuste to znovu.';
    }
    if (error.status === 403) {
        return 'Interakce nejsou momentálně k dispozici.';
    }
    if (error.status === 404) {
        return 'Workshopová místnost nebyla nalezena nebo zatím není publikovaná.';
    }
    if (error.status >= 500) {
        return 'Workshopová místnost je dočasně nedostupná. Zkuste to prosím znovu.';
    }
    return error.message;
}

export function useWorkshopParticipant(workshopSlug: string): WorkshopParticipantController {
    const [state, setState] = useState<WorkshopPublicState | null>(null);
    const [commentSort, setCommentSort] = useState<WorkshopCommentSort>('recent');
    const [isCheckingConnection, setIsCheckingConnection] = useState(true);
    const [isConnectionRequired, setIsConnectionRequired] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [newlyUnlockedContentBlockIds, setNewlyUnlockedContentBlockIds] = useState<ReadonlySet<string>>(new Set());
    const { subscribeToReactions, showReaction, showLoadedReactions } = useWorkshopReactionAnimations();
    const refreshSequenceRef = useRef(0);
    const realtimeRefreshTimeoutRef = useRef<number | null>(null);
    const isContentHistoryLoadedRef = useRef(false);
    const knownContentBlockIdsRef = useRef(new Set<string>());
    const lastPresenceReportAtRef = useRef<number | null>(null);
    const isConnectionReportedRef = useRef(false);
    const isConnected = state !== null;

    // Note: A calm room such as the community never waits for a broadcast, so it neither opens a channel for one nor
    //       polls quickly to make up for a channel which is not connected.
    const isRoomRealtime = state !== null && getWorkshopKindCapabilities(state.workshop.kind).isRealtime;

    const invalidatePendingRefresh = useCallback(() => {
        refreshSequenceRef.current += 1;
        setIsRefreshing(false);
    }, []);

    const processLoadedContentBlocks = useCallback(
        (contentBlocks: readonly WorkshopContentBlock[]) => {
            const loadedContentBlockIds = new Set(contentBlocks.map((contentBlock) => contentBlock.id));
            if (!isContentHistoryLoadedRef.current) {
                knownContentBlockIdsRef.current = loadedContentBlockIds;
                isContentHistoryLoadedRef.current = true;
                return;
            }

            const newlyUnlockedContentIds = Array.from(loadedContentBlockIds).filter(
                (contentBlockId) => !knownContentBlockIdsRef.current.has(contentBlockId),
            );
            knownContentBlockIdsRef.current = new Set([
                ...Array.from(knownContentBlockIdsRef.current),
                ...Array.from(loadedContentBlockIds),
            ]);
            if (newlyUnlockedContentIds.length === 0) {
                return;
            }

            setNewlyUnlockedContentBlockIds((currentContentBlockIds) =>
                new Set([...Array.from(currentContentBlockIds), ...newlyUnlockedContentIds]),
            );
            trackGoogleAnalyticsEvent('workshop_material_unlocked', {
                workshop_slug: workshopSlug,
                material_count: newlyUnlockedContentIds.length,
            });
            window.setTimeout(() => {
                setNewlyUnlockedContentBlockIds((currentContentBlockIds) => {
                    const remainingContentBlockIds = new Set(currentContentBlockIds);
                    newlyUnlockedContentIds.forEach((contentBlockId) => remainingContentBlockIds.delete(contentBlockId));
                    return remainingContentBlockIds;
                });
            }, NEW_CONTENT_UNLOCK_HIGHLIGHT_DURATION_MILLISECONDS);
        },
        [workshopSlug],
    );

    const refresh = useCallback(async (): Promise<boolean> => {
        const refreshSequence = ++refreshSequenceRef.current;
        setIsRefreshing(true);

        try {
            const loadedState = await fetchWorkshopState(workshopSlug, commentSort);
            if (refreshSequence !== refreshSequenceRef.current) {
                return false;
            }
            showLoadedReactions(loadedState.recentReactions);
            processLoadedContentBlocks(loadedState.contentBlocks);
            setState(loadedState);
            setIsConnectionRequired(false);
            setErrorMessage(null);
            return true;
        } catch (error) {
            if (refreshSequence !== refreshSequenceRef.current) {
                return false;
            }
            if (error instanceof WorkshopApiError && error.status === 401) {
                setState(null);
                setIsConnectionRequired(true);
                setErrorMessage(null);
            } else if (error instanceof WorkshopApiError && error.status === 404) {
                setState(null);
                setIsConnectionRequired(false);
                setErrorMessage(getCzechApiErrorMessage(error));
            } else {
                setErrorMessage(getCzechApiErrorMessage(error));
            }
            return false;
        } finally {
            if (refreshSequence === refreshSequenceRef.current) {
                setIsCheckingConnection(false);
                setIsRefreshing(false);
            }
        }
    }, [commentSort, processLoadedContentBlocks, showLoadedReactions, workshopSlug]);

    const scheduleRealtimeRefresh = useCallback(() => {
        if (realtimeRefreshTimeoutRef.current !== null) {
            return;
        }

        const delayMilliseconds = Math.random() * REALTIME_INVALIDATION_JITTER_MILLISECONDS;
        realtimeRefreshTimeoutRef.current = window.setTimeout(() => {
            realtimeRefreshTimeoutRef.current = null;
            void refresh();
        }, delayMilliseconds);
    }, [refresh]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        if (state === null || isConnectionReportedRef.current) {
            return;
        }

        isConnectionReportedRef.current = true;
        trackGoogleAnalyticsEvent('workshop_connected', { workshop_slug: state.workshop.slug });
    }, [state]);

    const applyWatchingParticipantCount = useCallback((watchingParticipantCount: number) => {
        // A count which did not survive the way back from the room is dropped, so the room keeps showing the last one.
        if (!Number.isSafeInteger(watchingParticipantCount) || watchingParticipantCount < 0) {
            return;
        }

        // Note: An unchanged count keeps the very same state, so a room which does not show it renders nothing again.
        setState((currentState) =>
            currentState === null || currentState.watchingParticipantCount === watchingParticipantCount
                ? currentState
                : { ...currentState, watchingParticipantCount },
        );
    }, []);

    const applyReactionCount = useCallback((emoji: string, reactionCount: number) => {
        if (!Number.isSafeInteger(reactionCount) || reactionCount < 0) {
            return;
        }

        setState((currentState) => {
            if (currentState === null) {
                return currentState;
            }

            const isReactionCountKnown = currentState.reactionCounts.some(
                (currentReactionCount) => currentReactionCount.emoji === emoji,
            );
            const reactionCounts = isReactionCountKnown
                ? currentState.reactionCounts.map((currentReactionCount) =>
                      currentReactionCount.emoji === emoji ? { emoji, count: reactionCount } : currentReactionCount,
                  )
                : [...currentState.reactionCounts, { emoji, count: reactionCount }];
            return { ...currentState, reactionCounts };
        });
    }, []);

    const reportCurrentPresence = useCallback(() => {
        const reportedAtMilliseconds = Date.now();
        const previousReportAtMilliseconds = lastPresenceReportAtRef.current;
        lastPresenceReportAtRef.current = reportedAtMilliseconds;
        if (previousReportAtMilliseconds === null) {
            return;
        }

        const activeDurationSeconds = Math.min(
            MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS,
            Math.floor((reportedAtMilliseconds - previousReportAtMilliseconds) / 1_000),
        );
        if (activeDurationSeconds < 1) {
            return;
        }

        void reportWorkshopPresence(workshopSlug, activeDurationSeconds)
            .then(({ watchingParticipantCount }) => applyWatchingParticipantCount(watchingParticipantCount))
            .catch((error) => {
                console.warn('Failed to report workshop participant presence:', error);
            });
    }, [applyWatchingParticipantCount, workshopSlug]);

    useEffect(() => {
        if (!isConnected) {
            lastPresenceReportAtRef.current = null;
            return;
        }

        lastPresenceReportAtRef.current = Date.now();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                reportCurrentPresence();
            }
        }, WORKSHOP_PRESENCE_REPORT_INTERVAL_MILLISECONDS);
        const handlePresenceVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                lastPresenceReportAtRef.current = Date.now();
                return;
            }
            reportCurrentPresence();
        };
        document.addEventListener('visibilitychange', handlePresenceVisibilityChange);
        window.addEventListener('pagehide', reportCurrentPresence);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handlePresenceVisibilityChange);
            window.removeEventListener('pagehide', reportCurrentPresence);
            reportCurrentPresence();
        };
    }, [isConnected, reportCurrentPresence]);

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        const isLiveUpdateMissing = isRoomRealtime && !isRealtimeConnected;
        const refreshInterval = isLiveUpdateMissing
            ? DISCONNECTED_REFRESH_MINIMUM_MILLISECONDS + Math.random() * DISCONNECTED_REFRESH_JITTER_MILLISECONDS
            : CONNECTED_REFRESH_MINIMUM_MILLISECONDS + Math.random() * CONNECTED_REFRESH_JITTER_MILLISECONDS;
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void refresh();
            }
        }, refreshInterval);
        return () => window.clearInterval(intervalId);
    }, [isConnected, isRealtimeConnected, isRoomRealtime, refresh]);

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void refresh();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isConnected, refresh]);

    useEffect(() => {
        if (state?.nextContentUnlockAt === null || state?.nextContentUnlockAt === undefined) {
            return;
        }

        const unlockDelay = getContentUnlockRefreshDelay(state.nextContentUnlockAt, state.serverTime, Date.now());
        const timeoutId = window.setTimeout(() => void refresh(), unlockDelay);
        return () => window.clearTimeout(timeoutId);
    }, [refresh, state?.nextContentUnlockAt, state?.serverTime]);

    useEffect(() => {
        if (!isConnected || !isRoomRealtime) {
            return;
        }

        const supabase = getSupabaseForBrowser();
        if (supabase === null) {
            return;
        }

        let isSubscriptionActive = true;
        const channel = supabase
            .channel(getWorkshopRealtimeTopic(workshopSlug), { config: { private: true } })
            .on('broadcast', { event: WORKSHOP_REALTIME_EVENT_NAME }, ({ payload }) => {
                if (!isWorkshopRealtimeEvent(payload)) {
                    return;
                }
                if (payload.kind === 'state-changed') {
                    scheduleRealtimeRefresh();
                    return;
                }
                if (payload.kind === 'reaction') {
                    showReaction(payload.reaction);
                    applyReactionCount(payload.reaction.emoji, payload.reactionCount);
                    return;
                }
                setState((currentState) => {
                    if (currentState === null) {
                        return currentState;
                    }

                    const updatedComments = currentState.comments.map((comment) =>
                        comment.id === payload.commentId ? { ...comment, upvoteCount: payload.upvoteCount } : comment,
                    );
                    return {
                        ...currentState,
                        comments: sortWorkshopComments(updatedComments, commentSort),
                    };
                });
            });

        void supabase.realtime
            .setAuth()
            .then(() => {
                if (isSubscriptionActive) {
                    channel.subscribe((status) => {
                        if (isSubscriptionActive) {
                            setIsRealtimeConnected(status === 'SUBSCRIBED');
                        }
                    });
                }
            })
            .catch((error) => {
                if (isSubscriptionActive) {
                    setIsRealtimeConnected(false);
                }
                console.error('Workshop realtime authorization failed:', error);
            });

        return () => {
            isSubscriptionActive = false;
            if (realtimeRefreshTimeoutRef.current !== null) {
                window.clearTimeout(realtimeRefreshTimeoutRef.current);
                realtimeRefreshTimeoutRef.current = null;
            }
            void supabase.removeChannel(channel);
        };
    }, [
        applyReactionCount,
        commentSort,
        isConnected,
        isRoomRealtime,
        scheduleRealtimeRefresh,
        showReaction,
        workshopSlug,
    ]);

    const connect = useCallback(
        async (values: { readonly fullname: string; readonly email: string }): Promise<boolean> => {
            setErrorMessage(null);
            try {
                const connection = await connectToWorkshop(workshopSlug, values);
                setIsConnectionRequired(false);
                if (connection.state !== null) {
                    showLoadedReactions(connection.state.recentReactions);
                    processLoadedContentBlocks(connection.state.contentBlocks);
                    setState(connection.state);
                    setIsCheckingConnection(false);
                    setIsRefreshing(false);
                    return true;
                }

                setIsCheckingConnection(true);
                await refresh();
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [processLoadedContentBlocks, refresh, showLoadedReactions, workshopSlug],
    );

    const changeFullname = useCallback(
        async (fullname: string): Promise<boolean> => {
            setErrorMessage(null);
            try {
                const { participant } = await changeWorkshopParticipantFullname(workshopSlug, fullname);
                setState((currentState) => (currentState === null ? currentState : { ...currentState, participant }));
                trackGoogleAnalyticsEvent('workshop_name_changed', { workshop_slug: workshopSlug });

                // The comments of this participant carry the new name only after the room is loaded again.
                void refresh();
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [refresh, workshopSlug],
    );

    const submitComment = useCallback(
        async (values: WorkshopCommentValues): Promise<boolean> => {
            setErrorMessage(null);
            try {
                const { comment } = await submitWorkshopComment(workshopSlug, values);
                invalidatePendingRefresh();
                if (comment.status !== 'rejected') {
                    setState((currentState) => {
                        if (currentState === null) {
                            return currentState;
                        }

                        const comments = currentState.comments.filter((currentComment) => currentComment.id !== comment.id);
                        return {
                            ...currentState,
                            comments: sortWorkshopComments([...comments, comment], commentSort),
                        };
                    });
                }
                trackGoogleAnalyticsEvent('workshop_comment_submitted', {
                    workshop_slug: workshopSlug,
                    comment_status: comment.status,
                    is_reply: comment.parentCommentId !== null,
                });
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [commentSort, invalidatePendingRefresh, workshopSlug],
    );

    const upvoteComment = useCallback(
        async (commentId: string) => {
            setErrorMessage(null);
            try {
                const result = await upvoteWorkshopComment(workshopSlug, commentId);
                setState((currentState) => {
                    if (currentState === null) {
                        return currentState;
                    }

                    const updatedComments = currentState.comments.map((comment) =>
                        comment.id === commentId
                            ? {
                                  ...comment,
                                  upvoteCount: result.upvoteCount,
                                  isUpvotedByParticipant: result.isUpvotedByParticipant,
                              }
                            : comment,
                    );
                    return {
                        ...currentState,
                        comments: sortWorkshopComments(updatedComments, commentSort),
                    };
                });
                trackGoogleAnalyticsEvent('workshop_comment_upvoted', { workshop_slug: workshopSlug });
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
            }
        },
        [commentSort, workshopSlug],
    );

    /**
     * Note: A moderated message and a moderated author both change what the whole room sees, so the room is loaded
     *       again instead of guessing the result of the decision which was just made.
     */
    const moderateComment = useCallback(
        async (commentId: string, values: WorkshopCommentModerationValues): Promise<boolean> => {
            setErrorMessage(null);
            try {
                await moderateWorkshopComment(workshopSlug, commentId, values);
                await refresh();
                trackGoogleAnalyticsEvent('workshop_comment_moderated', {
                    workshop_slug: workshopSlug,
                    comment_status: values.status,
                    is_body_edited: values.body !== undefined,
                    is_pin_changed: values.isPinned !== undefined,
                });
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [refresh, workshopSlug],
    );

    const moderateAuthor = useCallback(
        async (participantId: string, values: WorkshopAuthorModerationValues): Promise<boolean> => {
            setErrorMessage(null);
            try {
                await moderateWorkshopAuthor(workshopSlug, participantId, values);
                await refresh();
                trackGoogleAnalyticsEvent('workshop_author_moderated', { workshop_slug: workshopSlug });
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [refresh, workshopSlug],
    );

    const changeCommentSort = useCallback((nextCommentSort: WorkshopCommentSort) => {
        setCommentSort(nextCommentSort);
        setState((currentState) =>
            currentState === null
                ? currentState
                : {
                      ...currentState,
                      comments: sortWorkshopComments(currentState.comments, nextCommentSort),
                  },
        );
    }, []);

    const react = useCallback(
        async (emoji: string) => {
            try {
                const { reaction, reactionCount } = await sendWorkshopReaction(workshopSlug, emoji);
                showReaction(reaction);
                applyReactionCount(reaction.emoji, reactionCount);
                trackGoogleAnalyticsEvent('workshop_reaction_sent', { workshop_slug: workshopSlug, emoji });
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
            }
        },
        [applyReactionCount, showReaction, workshopSlug],
    );

    const recordMaterialLinkClick = useCallback(
        (contentId: string) => {
            void recordWorkshopMaterialLinkClick(workshopSlug, contentId)
                .then(() => trackGoogleAnalyticsEvent('workshop_material_link_clicked', { workshop_slug: workshopSlug }))
                .catch((error) => console.warn('Failed to record workshop material link click:', error));
        },
        [workshopSlug],
    );

    const saveFeedback = useCallback(
        async (values: WorkshopFeedbackValues): Promise<boolean> => {
            setErrorMessage(null);
            try {
                const { feedback } = await saveWorkshopFeedback(workshopSlug, values);
                setState((currentState) =>
                    currentState === null ? currentState : { ...currentState, feedback },
                );
                trackGoogleAnalyticsEvent('workshop_feedback_saved', {
                    workshop_slug: workshopSlug,
                    has_rating: values.rating !== undefined,
                    has_what_was_good: values.whatWasGood !== undefined,
                    has_what_was_bad: values.whatWasBad !== undefined,
                    has_note: values.note !== undefined,
                });
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [workshopSlug],
    );

    return {
        state,
        commentSort,
        isCheckingConnection,
        isConnectionRequired,
        isRefreshing,
        errorMessage,
        subscribeToReactions,
        newlyUnlockedContentBlockIds,
        connect,
        changeFullname,
        refresh,
        changeCommentSort,
        submitComment,
        upvoteComment,
        moderateComment,
        moderateAuthor,
        react,
        recordMaterialLinkClick,
        saveFeedback,
    };
}
