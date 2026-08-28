'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { AiTaKrajtaSnakeGame } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnakeGame';
import { formatCzechCountedNoun } from '@/businesses/ai-ta-krajta/aiTaKrajtaFormatting';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

/**
 * What the snake says while it is still asleep and while it is being fed
 */
const SLEEPING_HINT = 'Klikněte na krajtu. Nudí se.';
const PLAYING_HINT = 'Sbírejte tokeny. Roste z nich.';

/**
 * The logo which turns into a game
 *
 * Note: The snake starts as the mark of the show and uncoils only when a visitor asks for it, so nobody who came to
 *       find an episode gets a moving canvas thrown at them.
 */
export function AiTaKrajtaSnakeTerrarium() {
    const { viewState, setIsGamePlayed } = useAiTaKrajtaPageState();
    const [score, setScore] = useState(0);

    const handleScoreChange = useCallback((newScore: number) => setScore(newScore), []);

    return (
        <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#232a25] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[2.5rem]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] [background-size:22px_22px]" />

                {viewState.isGamePlayed ? (
                    <AiTaKrajtaSnakeGame onScoreChange={handleScoreChange} />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsGamePlayed(true)}
                        className="group absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b6b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#232a25]"
                    >
                        <motion.span
                            animate={{ y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="block w-1/2 max-w-[13rem]"
                        >
                            <AiTaKrajtaMark className="h-full w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105" />
                        </motion.span>
                    </button>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <p className="text-white/50">{viewState.isGamePlayed ? PLAYING_HINT : SLEEPING_HINT}</p>

                {viewState.isGamePlayed ? (
                    <div className="flex shrink-0 items-center gap-3">
                        <span className="tabular-nums font-semibold text-white">
                            {formatCzechCountedNoun(score, ['token', 'tokeny', 'tokenů'])}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsGamePlayed(false)}
                            className="text-white/50 underline underline-offset-4 transition-colors hover:text-white"
                        >
                            Uspat
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsGamePlayed(true)}
                        className="shrink-0 font-semibold text-[#ff9b8f] underline underline-offset-4 transition-colors hover:text-white"
                    >
                        Probudit
                    </button>
                )}
            </div>
        </div>
    );
}
