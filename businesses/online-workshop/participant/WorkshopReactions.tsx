'use client';

import { useState } from 'react';

type WorkshopReactionsProps = {
    readonly emojis: readonly string[];
    readonly onReact: (emoji: string) => Promise<void>;
};

export function WorkshopReactions({ emojis, onReact }: WorkshopReactionsProps) {
    const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
    const [isSendingReaction, setIsSendingReaction] = useState(false);

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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <span className="mr-2 text-xs font-medium uppercase tracking-wider text-slate-500">Reakce</span>
            {emojis.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    disabled={isSendingReaction}
                    onClick={() => void handleReaction(emoji)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-wait disabled:opacity-60 ${activeEmoji === emoji ? 'scale-125 border-cyan-300/50 bg-cyan-300/15' : 'border-white/10 bg-white/5'}`}
                    aria-label={`Reagovat ${emoji}`}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
}
