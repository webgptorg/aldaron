'use client';

import type { WorkshopReactionSummary } from '@/lib/workshop/workshopTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One reaction which is right now flying over the stream
 */
export type FloatingReaction = {
    readonly floatingReactionId: number;
    readonly reactionEmoji: string;

    /**
     * Where across the width of the bar the reaction flies up, so that two of them rarely overlap
     */
    readonly horizontalOffsetPercent: number;
};

/**
 * How long one reaction flies before it is forgotten, which matches the animation
 */
const FLOATING_REACTION_DURATION_MS = 2800;

/**
 * How many reactions of one kind are shown from a single round
 *
 * Note: When a hundred people clap at once, showing a hundred emojis would only make a mess.
 */
const MAXIMAL_FLOATING_REACTIONS_PER_ROUND = 6;

type UseFloatingReactionsResult = {
    readonly floatingReactions: readonly FloatingReaction[];

    /**
     * Let the own reaction fly right away, without waiting for the server to confirm it
     */
    readonly addOwnFloatingReaction: (reactionEmoji: string) => void;
};

/**
 * Turn the counted reactions into emojis flying over the stream
 *
 * Note: Only what really arrived since the previous answer flies, so opening the page in the middle of the workshop
 *       does not blow the whole history into the face of the participant.
 */
export function useFloatingReactions(reactions: readonly WorkshopReactionSummary[]): UseFloatingReactionsResult {
    const [floatingReactions, setFloatingReactions] = useState<readonly FloatingReaction[]>([]);
    const previousTotalCountsRef = useRef<ReadonlyMap<string, number> | null>(null);
    const ownReactionCountsRef = useRef<Map<string, number>>(new Map());
    const nextFloatingReactionIdRef = useRef(0);

    const addFloatingReactions = useCallback((reactionEmojis: readonly string[]) => {
        if (reactionEmojis.length === 0) {
            return;
        }

        const arrivedFloatingReactions = reactionEmojis.map((reactionEmoji) => ({
            floatingReactionId: nextFloatingReactionIdRef.current++,
            reactionEmoji,
            horizontalOffsetPercent: Math.round(Math.random() * 80) + 10,
        }));

        setFloatingReactions((previousFloatingReactions) => [
            ...previousFloatingReactions,
            ...arrivedFloatingReactions,
        ]);

        setTimeout(() => {
            const arrivedIds = new Set(
                arrivedFloatingReactions.map((floatingReaction) => floatingReaction.floatingReactionId),
            );

            setFloatingReactions((previousFloatingReactions) =>
                previousFloatingReactions.filter(
                    (floatingReaction) => !arrivedIds.has(floatingReaction.floatingReactionId),
                ),
            );
        }, FLOATING_REACTION_DURATION_MS);
    }, []);

    const addOwnFloatingReaction = useCallback(
        (reactionEmoji: string) => {
            const ownReactionCounts = ownReactionCountsRef.current;
            ownReactionCounts.set(reactionEmoji, (ownReactionCounts.get(reactionEmoji) || 0) + 1);

            addFloatingReactions([reactionEmoji]);
        },
        [addFloatingReactions],
    );

    useEffect(() => {
        const previousTotalCounts = previousTotalCountsRef.current;

        previousTotalCountsRef.current = new Map(
            reactions.map((reaction) => [reaction.reactionEmoji, reaction.totalCount]),
        );

        // Note: The very first answer is the history of the workshop, not something which just happened
        if (previousTotalCounts === null) {
            return;
        }

        const arrivedReactionEmojis: string[] = [];

        for (const reaction of reactions) {
            const arrivedCount = reaction.totalCount - (previousTotalCounts.get(reaction.reactionEmoji) || 0);

            // Note: The own reactions already flew the moment they were clicked, they must not fly again once the
            //       server counts them in
            const ownReactionCounts = ownReactionCountsRef.current;
            const alreadyFlownCount = Math.min(ownReactionCounts.get(reaction.reactionEmoji) || 0, arrivedCount);
            ownReactionCounts.set(reaction.reactionEmoji, (ownReactionCounts.get(reaction.reactionEmoji) || 0) - alreadyFlownCount);

            const flyingCount = Math.min(arrivedCount - alreadyFlownCount, MAXIMAL_FLOATING_REACTIONS_PER_ROUND);

            for (let reactionIndex = 0; reactionIndex < flyingCount; reactionIndex++) {
                arrivedReactionEmojis.push(reaction.reactionEmoji);
            }
        }

        addFloatingReactions(arrivedReactionEmojis);
    }, [addFloatingReactions, reactions]);

    return { floatingReactions, addOwnFloatingReaction };
}
