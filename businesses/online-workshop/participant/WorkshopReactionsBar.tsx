'use client';

import { useFloatingReactions } from '@/businesses/online-workshop/participant/useFloatingReactions';
import type { WorkshopReactionSummary } from '@/lib/workshop/workshopTypes';
import { AnimatePresence, motion } from 'framer-motion';

type WorkshopReactionsBarProps = {
    readonly reactions: readonly WorkshopReactionSummary[];
    readonly onSendReaction: (reactionEmoji: string) => void;
};

/**
 * The reactions of the whole room
 *
 * Note: A click sends the reaction and lets it fly right away, the reactions of the others fly as they arrive with
 *       the next round.
 */
export function WorkshopReactionsBar({ reactions, onSendReaction }: WorkshopReactionsBarProps) {
    const { floatingReactions, addOwnFloatingReaction } = useFloatingReactions(reactions);

    const handleReactionClick = (reactionEmoji: string) => {
        addOwnFloatingReaction(reactionEmoji);
        onSendReaction(reactionEmoji);
    };

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 bottom-full h-40 overflow-hidden">
                <AnimatePresence>
                    {floatingReactions.map((floatingReaction) => (
                        <motion.span
                            key={floatingReaction.floatingReactionId}
                            initial={{ opacity: 0, y: 0, scale: 0.6 }}
                            animate={{ opacity: [0, 1, 1, 0], y: -150, scale: 1.15 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2.8, ease: 'easeOut' }}
                            style={{ left: `${floatingReaction.horizontalOffsetPercent}%` }}
                            className="absolute bottom-0 text-3xl"
                        >
                            {floatingReaction.reactionEmoji}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-2">
                {reactions.map((reaction) => (
                    <button
                        key={reaction.reactionEmoji}
                        type="button"
                        onClick={() => handleReactionClick(reaction.reactionEmoji)}
                        aria-label={`Poslat reakci ${reaction.reactionEmoji}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-lg transition-all hover:scale-105 hover:border-cyan-300/40 hover:bg-white/15 active:scale-95"
                    >
                        <span>{reaction.reactionEmoji}</span>
                        <span className="text-sm font-semibold tabular-nums text-white/60">{reaction.totalCount}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
