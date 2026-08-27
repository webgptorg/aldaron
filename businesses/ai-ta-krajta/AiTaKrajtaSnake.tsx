'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { useState, type PointerEvent } from 'react';

const SNAKE_MESSAGES = [
    'Klikni na krajtu. Má k tomu celý týden načtený kontext.',
    'Sss. Nový model není automaticky nový názor.',
    'Krajta se otáčí za kurzorem. V debatě se otáčíme za dobrým argumentem.',
    'Někdy stačí pustit jeden díl místo deseti AI newsletterů.',
] as const;

const MAXIMUM_HEAD_TILT_DEGREES = 7;

/**
 * A small interactive mascot. It shares the compact page mark so the logo appears to wake up in the hero.
 */
export function AiTaKrajtaSnake() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [headTiltDegrees, setHeadTiltDegrees] = useState(0);
    const [isAwake, setIsAwake] = useState(false);
    const message = SNAKE_MESSAGES[messageIndex] ?? SNAKE_MESSAGES[0];

    const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
        const boundary = event.currentTarget.getBoundingClientRect();
        const relativePointerPosition = (event.clientX - boundary.left) / boundary.width;
        const nextHeadTiltDegrees = (relativePointerPosition - 0.5) * MAXIMUM_HEAD_TILT_DEGREES * 2;

        setHeadTiltDegrees(nextHeadTiltDegrees);
    };

    const handlePointerLeave = () => {
        setHeadTiltDegrees(0);
    };

    const handleSnakeClick = () => {
        setIsAwake(true);
        setMessageIndex((currentMessageIndex) => (currentMessageIndex + 1) % SNAKE_MESSAGES.length);
    };

    return (
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
            <div className="pointer-events-none absolute inset-8 rounded-full border border-dashed border-white/15" />
            <div className="pointer-events-none absolute inset-16 rounded-full border border-white/10" />

            <button
                type="button"
                onClick={handleSnakeClick}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="group relative z-10 flex aspect-square w-full max-w-[21rem] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#303832]"
                aria-label="Probudit krajtu"
            >
                <motion.div
                    animate={{ rotate: headTiltDegrees, scale: isAwake ? 1.04 : 1, y: [0, -10, 0] }}
                    transition={{
                        rotate: { type: 'spring', stiffness: 230, damping: 18 },
                        scale: { type: 'spring', stiffness: 280, damping: 17 },
                        y: { duration: isAwake ? 1.35 : 2.8, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="relative flex h-56 w-56 items-center justify-center rounded-[2.5rem] border border-white/15 bg-[#f8f7f1]/95 p-7 shadow-[0_28px_75px_rgba(0,0,0,0.36)] transition-shadow duration-300 group-hover:shadow-[0_34px_90px_rgba(0,0,0,0.48)] sm:h-64 sm:w-64"
                >
                    <AiTaKrajtaMark className="h-full w-full drop-shadow-[0_16px_18px_rgba(71,55,75,0.22)]" />
                    <motion.span
                        animate={{ opacity: isAwake ? [0.15, 0.72, 0.15] : [0.08, 0.35, 0.08] }}
                        transition={{ duration: isAwake ? 0.8 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="pointer-events-none absolute -right-5 top-7 h-10 w-10 rounded-full bg-[#ff6b6b]/45 blur-xl"
                    />
                </motion.div>

                <span className="absolute -bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-[#171d1a]/85 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1">
                    <MousePointer2 className="h-3.5 w-3.5 text-[#ff9c90]" />
                    Probudit krajtu
                </span>
            </button>

            <p aria-live="polite" className="relative z-10 mt-8 max-w-xs text-center text-sm leading-relaxed text-white/72">
                {message}
            </p>
        </div>
    );
}
