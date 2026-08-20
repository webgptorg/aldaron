'use client';

import type { FlyingWorkshopReaction } from '@/lib/workshops/workshopReactionAnimations';
import type { WorkshopReaction } from '@/lib/workshops/workshopTypes';
import { useCallback, useRef } from 'react';

/**
 * How many reactions the room remembers having shown already
 *
 * Note: The room learns about a reaction from the realtime channel and again from the next load of the state, so it
 *       remembers what it has already celebrated. Only the newest reactions are worth remembering, because an older
 *       one is never loaded again.
 */
const MAXIMAL_REMEMBERED_REACTION_COUNT = 500;

/**
 * How many missed reactions are celebrated when the realtime channel did not deliver them
 */
const MAXIMAL_FALLBACK_ANIMATED_REACTION_COUNT = 6;

type WorkshopReactionListener = (reaction: FlyingWorkshopReaction) => void;

/**
 * Asks to hear about every reaction which deserves to fly, and answers with the way to stop listening
 */
export type SubscribeToWorkshopReactions = (listener: WorkshopReactionListener) => () => void;

export type WorkshopReactionAnimationController = {
    readonly subscribeToReactions: SubscribeToWorkshopReactions;

    /**
     * Celebrates one reaction which just happened, unless the room celebrated it already
     */
    readonly showReaction: (reaction: WorkshopReaction) => void;

    /**
     * Catches up with the reactions a load of the state brought in
     */
    readonly showLoadedReactions: (loadedReactions: readonly WorkshopReaction[]) => void;
};

/**
 * Decides which reactions of a workshop deserve to fly over the stage
 *
 * Note: What is on the stage and for how long belongs to the reaction stream of the stage itself, this hook only
 *       answers whether the room has seen a reaction before, so that neither the realtime channel nor a reload
 *       celebrates one twice.
 * Note: A reaction is told to whoever listens instead of being kept here, so a busy room re-renders the stage which
 *       draws the reactions and never the chat or the materials next to it.
 */
export function useWorkshopReactionAnimations(): WorkshopReactionAnimationController {
    const reactionListenersRef = useRef(new Set<WorkshopReactionListener>());
    const rememberedReactionIdsRef = useRef(new Set<string>());
    const rememberedReactionIdOrderRef = useRef<string[]>([]);
    const isReactionHistoryLoadedRef = useRef(false);

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

    const subscribeToReactions = useCallback((listener: WorkshopReactionListener) => {
        reactionListenersRef.current.add(listener);
        return () => {
            reactionListenersRef.current.delete(listener);
        };
    }, []);

    const showReaction = useCallback(
        (reaction: WorkshopReaction) => {
            if (!rememberReactionId(reaction.id)) {
                return;
            }

            const flyingReaction = { flightId: `${reaction.id}-${Date.now()}`, reactionText: reaction.emoji };
            reactionListenersRef.current.forEach((listener) => listener(flyingReaction));
        },
        [rememberReactionId],
    );

    const showLoadedReactions = useCallback(
        (loadedReactions: readonly WorkshopReaction[]) => {
            // The reactions which happened before the participant opened the room are history, not something to celebrate.
            if (!isReactionHistoryLoadedRef.current) {
                loadedReactions.forEach((reaction) => rememberReactionId(reaction.id));
                isReactionHistoryLoadedRef.current = true;
                return;
            }

            const unseenReactions = loadedReactions.filter(
                (reaction) => !rememberedReactionIdsRef.current.has(reaction.id),
            );
            const celebratedReactionIds = new Set(
                unseenReactions.slice(0, MAXIMAL_FALLBACK_ANIMATED_REACTION_COUNT).map((reaction) => reaction.id),
            );

            unseenReactions
                .filter((reaction) => !celebratedReactionIds.has(reaction.id))
                .forEach((reaction) => rememberReactionId(reaction.id));
            unseenReactions
                .filter((reaction) => celebratedReactionIds.has(reaction.id))
                .reverse()
                .forEach(showReaction);
        },
        [rememberReactionId, showReaction],
    );

    return { subscribeToReactions, showReaction, showLoadedReactions };
}
