'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AiTaKrajtaSnakeGame } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnakeGame';
import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * The logo which turns into a game
 *
 * Note: The snake starts as the mark of the show and uncoils only when a visitor asks for it, so nobody who came to
 *       find an episode gets a moving canvas thrown at them.
 */
export function AiTaKrajtaSnakeTerrarium() {
    const [isGamePlayed, setIsGamePlayed] = useState(false);

    return (
        <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#232a25] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[2.5rem]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] [background-size:22px_22px]" />

                {isGamePlayed ? (
                    <AiTaKrajtaSnakeGame />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            animate={{ y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="block w-1/2 max-w-[13rem]"
                        >
                            <AiTaKrajtaMark className="h-full w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]" />
                        </motion.span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    aria-pressed={isGamePlayed}
                    onClick={() => setIsGamePlayed((isGamePlayed) => !isGamePlayed)}
                    className="font-semibold text-[#ff9b8f] underline underline-offset-4 transition-colors hover:text-white"
                >
                    {isGamePlayed ? 'Uspat' : 'Probudit'}
                </button>
            </div>
        </div>
    );
}
