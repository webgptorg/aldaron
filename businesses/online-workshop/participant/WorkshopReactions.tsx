'use client';

import type { WorkshopReactionCount } from '@/lib/workshops/workshopTypes';
import { useMemo, useState } from 'react';

const CZECH_LOCALE = 'cs-CZ';

type WorkshopReactionsProps = {
    readonly emojis: readonly string[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly isInteractionBanned: boolean;
    readonly onReact: (emoji: string) => Promise<void>;
};

type WorkshopReactionButtonProps = {
    readonly emoji: string;
    readonly reactionCount: number;
    readonly isActive: boolean;
    readonly isDisabled: boolean;
    readonly onReact: (emoji: string) => void;
};

function WorkshopReactionButton({
    emoji,
    reactionCount,
    isActive,
    isDisabled,
    onReact,
}: WorkshopReactionButtonProps) {
    const formattedReactionCount = reactionCount.toLocaleString(CZECH_LOCALE);

    return (
        <div className="relative">
            <button
                type="button"
                disabled={isDisabled}
                onClick={() => onReact(emoji)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-wait disabled:opacity-60 ${isActive ? 'scale-125 border-cyan-300/50 bg-cyan-300/15' : 'border-white/10 bg-white/5'}`}
                aria-label={`Reagovat ${emoji}; počet reakcí ${formattedReactionCount}`}
            >
                {emoji}
            </button>
            <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 min-w-5 rounded-full border border-cyan-100/20 bg-[#0d2632] px-1 text-center text-[10px] font-bold leading-5 tabular-nums text-cyan-100 shadow-sm"
            >
                {formattedReactionCount}
            </span>
        </div>
    );
}

export function WorkshopReactions({ emojis, reactionCounts, isInteractionBanned, onReact }: WorkshopReactionsProps) {
    const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
    const [isSendingReaction, setIsSendingReaction] = useState(false);
    const reactionCountByEmoji = useMemo(
        () => new Map(reactionCounts.map((reactionCount) => [reactionCount.emoji, reactionCount.count])),
        [reactionCounts],
    );

    const handleReaction = async (emoji: string) => {
        if (isSendingReaction) {
            return;
        }

        setIsSendingReaction(true);
        setActiveEmoji(emoji);
        try {
            await onReact(emoji);
        } finally {
            setIsSendingReaction(false);
        }
        window.setTimeout(() => setActiveEmoji((currentEmoji) => (currentEmoji === emoji ? null : currentEmoji)), 180);
    };

    return (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4">
            <span className="w-full text-center text-xs font-medium uppercase tracking-wider text-slate-500 sm:mr-2 sm:w-auto">
                Reakce
            </span>
            {emojis.map((emoji) => (
                <WorkshopReactionButton
                    key={emoji}
                    emoji={emoji}
                    reactionCount={reactionCountByEmoji.get(emoji) ?? 0}
                    isActive={activeEmoji === emoji}
                    isDisabled={isSendingReaction || isInteractionBanned}
                    onReact={(reactionEmoji) => void handleReaction(reactionEmoji)}
                />
            ))}
        </div>
    );
}
