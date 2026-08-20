'use client';

import { getWorkshopReactionAnimation, type FlyingWorkshopReaction } from '@/lib/workshops/workshopReactionAnimations';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * How many reactions the stage shows at the very same moment
 *
 * Note: A workshop of thousands of participants sends far more than that, so the oldest reactions make room for the
 *       newest ones. The stage stays readable and, more importantly, the browser of every single participant animates
 *       a fixed number of elements no matter how busy the room gets.
 */
const MAXIMAL_SIMULTANEOUS_REACTION_COUNT = 24;

/**
 * How often the stream looks for reactions which finished their flight
 *
 * Note: One sweep for the whole stage instead of a timer per reaction, so a burst of a thousand reactions still leaves
 *       exactly one timer running.
 */
const REACTION_EXPIRY_SWEEP_INTERVAL_MILLISECONDS = 500;

/**
 * How long a finished reaction is still kept, so that it is never taken away mid-flight on a busy device
 */
const REACTION_EXPIRY_TAIL_MILLISECONDS = 200;

type ExpiringWorkshopReaction = FlyingWorkshopReaction & {
    readonly expiresAtMilliseconds: number;
};

export type WorkshopReactionStreamController = {
    readonly flyingReactions: readonly FlyingWorkshopReaction[];

    /**
     * Sends one reaction over the stage
     */
    readonly launchReaction: (reaction: FlyingWorkshopReaction) => void;
};

/**
 * Keeps the reactions which are flying over a stage right now
 *
 * Note: The stream owns nothing but the lifetime of a flight, so both the room of a workshop and the preview in the
 *       administration show reactions the very same way and neither of them repeats the counting.
 * Note: Reactions which arrive together are collected and handed over in one single frame. A room where a thousand
 *       participants clap at once therefore re-renders the stage a few times per second instead of a hundred times.
 */
export function useWorkshopReactionStream(): WorkshopReactionStreamController {
    const [flyingReactions, setFlyingReactions] = useState<readonly ExpiringWorkshopReaction[]>([]);
    const pendingReactionsRef = useRef<ExpiringWorkshopReaction[]>([]);
    const flushHandleRef = useRef<number | null>(null);
    const isStreamEmpty = flyingReactions.length === 0;

    const flushPendingReactions = useCallback(() => {
        flushHandleRef.current = null;
        const pendingReactions = pendingReactionsRef.current;
        if (pendingReactions.length === 0) {
            return;
        }

        pendingReactionsRef.current = [];
        setFlyingReactions((currentReactions) =>
            [...currentReactions, ...pendingReactions].slice(-MAXIMAL_SIMULTANEOUS_REACTION_COUNT),
        );
    }, []);

    const launchReaction = useCallback(
        (reaction: FlyingWorkshopReaction) => {
            const { durationMilliseconds } = getWorkshopReactionAnimation(reaction.reactionText);
            pendingReactionsRef.current.push({
                ...reaction,
                expiresAtMilliseconds: Date.now() + durationMilliseconds + REACTION_EXPIRY_TAIL_MILLISECONDS,
            });

            // A tab in the background never gets a frame, so the waiting reactions are bounded just like the flying ones.
            if (pendingReactionsRef.current.length > MAXIMAL_SIMULTANEOUS_REACTION_COUNT) {
                pendingReactionsRef.current.shift();
            }
            if (flushHandleRef.current === null) {
                flushHandleRef.current = window.requestAnimationFrame(flushPendingReactions);
            }
        },
        [flushPendingReactions],
    );

    useEffect(() => {
        if (isStreamEmpty) {
            return;
        }

        const intervalId = window.setInterval(() => {
            const sweptAtMilliseconds = Date.now();
            setFlyingReactions((currentReactions) => {
                const remainingReactions = currentReactions.filter(
                    (currentReaction) => currentReaction.expiresAtMilliseconds > sweptAtMilliseconds,
                );

                // The very same list keeps the stage from re-rendering when every reaction is still in the air.
                return remainingReactions.length === currentReactions.length ? currentReactions : remainingReactions;
            });
        }, REACTION_EXPIRY_SWEEP_INTERVAL_MILLISECONDS);
        return () => window.clearInterval(intervalId);
    }, [isStreamEmpty]);

    useEffect(
        () => () => {
            if (flushHandleRef.current !== null) {
                window.cancelAnimationFrame(flushHandleRef.current);
                flushHandleRef.current = null;
            }
        },
        [],
    );

    return { flyingReactions, launchReaction };
}
