'use client';

import {
    connectToWorkshop,
    fetchWorkshopState,
    sendWorkshopReaction,
    submitWorkshopComment,
    upvoteWorkshopComment,
    WorkshopApiError,
} from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { getSupabaseForBrowser } from '@/lib/supabase';
import { getWorkshopRealtimeTopic, WORKSHOP_REALTIME_EVENT_NAME } from '@/lib/workshops/workshopConstants';
import {
    getContentUnlockRefreshDelay,
    isWorkshopRealtimeEvent,
    sortWorkshopComments,
} from '@/lib/workshops/workshopClientState';
import type { WorkshopCommentSort, WorkshopPublicState, WorkshopReaction } from '@/lib/workshops/workshopTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

const DISCONNECTED_REFRESH_MINIMUM_MILLISECONDS = 25_000;
const DISCONNECTED_REFRESH_JITTER_MILLISECONDS = 10_000;
const CONNECTED_REFRESH_MINIMUM_MILLISECONDS = 120_000;
const CONNECTED_REFRESH_JITTER_MILLISECONDS = 30_000;
const REALTIME_INVALIDATION_JITTER_MILLISECONDS = 1_250;
const REACTION_ANIMATION_DURATION_MILLISECONDS = 2_800;
const MAXIMAL_REMEMBERED_REACTION_COUNT = 500;
const MAXIMAL_FALLBACK_ANIMATED_REACTION_COUNT = 6;
const MAXIMAL_SIMULTANEOUS_ANIMATED_REACTION_COUNT = 24;

export type AnimatedWorkshopReaction = WorkshopReaction & {
    readonly animationId: string;
};

type WorkshopParticipantController = {
    readonly state: WorkshopPublicState | null;
    readonly commentSort: WorkshopCommentSort;
    readonly isCheckingConnection: boolean;
    readonly isConnectionRequired: boolean;
    readonly isRefreshing: boolean;
    readonly errorMessage: string | null;
    readonly pendingCommentMessage: string | null;
    readonly animatedReactions: readonly AnimatedWorkshopReaction[];
    readonly connect: (values: { readonly fullname: string; readonly email: string }) => Promise<boolean>;
    readonly refresh: () => Promise<boolean>;
    readonly changeCommentSort: (sort: WorkshopCommentSort) => void;
    readonly submitComment: (body: string) => Promise<boolean>;
    readonly upvoteComment: (commentId: string) => Promise<void>;
    readonly react: (emoji: string) => Promise<void>;
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
        return 'Tento požadavek nebylo možné bezpečně ověřit. Obnovte prosím stránku.';
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
    const [pendingCommentMessage, setPendingCommentMessage] = useState<string | null>(null);
    const [animatedReactions, setAnimatedReactions] = useState<readonly AnimatedWorkshopReaction[]>([]);
    const refreshSequenceRef = useRef(0);
    const rememberedReactionIdsRef = useRef(new Set<string>());
    const rememberedReactionIdOrderRef = useRef<string[]>([]);
    const isReactionHistoryLoadedRef = useRef(false);
    const realtimeRefreshTimeoutRef = useRef<number | null>(null);
    const isConnected = state !== null;

    const rememberReactionId = useCallback((reactionId: string): boolean => {
        if (rememberedReactionIdsRef.current.has(reactionId)) {
            return false;
        }

        rememberedReactionIdsRef.current.add(reactionId);
        rememberedReactionIdOrderRef.current.push(reactionId);
        if (rememberedReactionIdOrderRef.current.length > MAXIMAL_REMEMBERED_REACTION_COUNT) {
            const forgottenReactionId = rememberedReactionIdOrderRef.current.shift();
            if (forgottenReactionId !== undefined) {
                rememberedReactionIdsRef.current.delete(forgottenReactionId);
            }
        }
        return true;
    }, []);

    const addAnimatedReaction = useCallback(
        (reaction: WorkshopReaction) => {
            if (!rememberReactionId(reaction.id)) {
                return;
            }

            const animationId = `${reaction.id}-${Date.now()}`;
            setAnimatedReactions((currentReactions) =>
                [...currentReactions, { ...reaction, animationId }].slice(
                    -MAXIMAL_SIMULTANEOUS_ANIMATED_REACTION_COUNT,
                ),
            );
            window.setTimeout(() => {
                setAnimatedReactions((currentReactions) =>
                    currentReactions.filter((currentReaction) => currentReaction.animationId !== animationId),
                );
            }, REACTION_ANIMATION_DURATION_MILLISECONDS);
        },
        [rememberReactionId],
    );

    const processLoadedReactions = useCallback(
        (loadedReactions: readonly WorkshopReaction[]) => {
            if (!isReactionHistoryLoadedRef.current) {
                loadedReactions.forEach((reaction) => rememberReactionId(reaction.id));
                isReactionHistoryLoadedRef.current = true;
                return;
            }

            const unseenReactions = loadedReactions.filter(
                (reaction) => !rememberedReactionIdsRef.current.has(reaction.id),
            );
            const animatedReactionIds = new Set(
                unseenReactions.slice(0, MAXIMAL_FALLBACK_ANIMATED_REACTION_COUNT).map((reaction) => reaction.id),
            );

            unseenReactions
                .filter((reaction) => !animatedReactionIds.has(reaction.id))
                .forEach((reaction) => rememberReactionId(reaction.id));
            unseenReactions
                .filter((reaction) => animatedReactionIds.has(reaction.id))
                .reverse()
                .forEach(addAnimatedReaction);
        },
        [addAnimatedReaction, rememberReactionId],
    );

    const refresh = useCallback(async (): Promise<boolean> => {
        const refreshSequence = ++refreshSequenceRef.current;
        setIsRefreshing(true);

        try {
            const loadedState = await fetchWorkshopState(workshopSlug, commentSort);
            if (refreshSequence !== refreshSequenceRef.current) {
                return false;
            }
            processLoadedReactions(loadedState.recentReactions);
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
    }, [commentSort, processLoadedReactions, workshopSlug]);

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
        if (!isConnected) {
            return;
        }

        const refreshInterval = isRealtimeConnected
            ? CONNECTED_REFRESH_MINIMUM_MILLISECONDS + Math.random() * CONNECTED_REFRESH_JITTER_MILLISECONDS
            : DISCONNECTED_REFRESH_MINIMUM_MILLISECONDS + Math.random() * DISCONNECTED_REFRESH_JITTER_MILLISECONDS;
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void refresh();
            }
        }, refreshInterval);
        return () => window.clearInterval(intervalId);
    }, [isConnected, isRealtimeConnected, refresh]);

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
        if (!isConnected) {
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
                    addAnimatedReaction(payload.reaction);
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
    }, [addAnimatedReaction, commentSort, isConnected, scheduleRealtimeRefresh, workshopSlug]);

    const connect = useCallback(
        async (values: { readonly fullname: string; readonly email: string }): Promise<boolean> => {
            setErrorMessage(null);
            try {
                const connection = await connectToWorkshop(workshopSlug, values);
                setIsConnectionRequired(false);
                if (connection.state !== null) {
                    processLoadedReactions(connection.state.recentReactions);
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
        [processLoadedReactions, refresh, workshopSlug],
    );

    const submitComment = useCallback(
        async (body: string): Promise<boolean> => {
            setErrorMessage(null);
            try {
                await submitWorkshopComment(workshopSlug, body);
                setPendingCommentMessage('Komentář čeká na schválení. Po schválení se automaticky objeví v chatu.');
                return true;
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
                return false;
            }
        },
        [workshopSlug],
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
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
            }
        },
        [commentSort, workshopSlug],
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
                const { reaction } = await sendWorkshopReaction(workshopSlug, emoji);
                addAnimatedReaction(reaction);
            } catch (error) {
                setErrorMessage(getCzechApiErrorMessage(error));
            }
        },
        [addAnimatedReaction, workshopSlug],
    );

    return {
        state,
        commentSort,
        isCheckingConnection,
        isConnectionRequired,
        isRefreshing,
        errorMessage,
        pendingCommentMessage,
        animatedReactions,
        connect,
        refresh,
        changeCommentSort,
        submitComment,
        upvoteComment,
        react,
    };
}
