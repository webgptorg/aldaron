'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AiTaKrajtaSnakeGame } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnakeGame';
import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * The logo which turns into a game
 *
 * Note: The snake starts as the mark of the show and uncoils when a visitor clicks it, so nobody who came to find an
 *       episode gets a moving canvas thrown at them.
 */
export function AiTaKrajtaSnakeTerrarium() {
    const [isGameRunning, setIsGameRunning] = useState(false);

    const handleGameStart = () => {
        setIsGameRunning(true);
    };

    return (
        <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#232a25] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[2.5rem]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] [background-size:22px_22px]" />

                {isGameRunning ? (
                    <AiTaKrajtaSnakeGame />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleGameStart}
                            className="block w-1/2 max-w-[13rem] cursor-pointer rounded-full bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#ff9b8f]"
                            aria-label="Spustit minihru s krajtou"
                        >
                            <motion.span
                                animate={{ y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                className="block"
                            >
                                <AiTaKrajtaMark className="h-full w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]" />
                            </motion.span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
