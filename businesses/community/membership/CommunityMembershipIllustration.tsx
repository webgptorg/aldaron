'use client';

import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import { useWorkshopReactionStream } from '@/components/workshops/useWorkshopReactionStream';
import { Code2, MessageCircleMore, Users } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';

const COMMUNITY_REACTION_SEQUENCE = ['</>', '💡', '🔥', '👏', '✨'] as const;
const REACTION_INTERVAL_MILLISECONDS = 1_050;

/**
 * A compact community-room scene. Its reactions use the exact animation registry and renderer used by workshops,
 * rather than a landing-page imitation which could drift from the product.
 */
export function CommunityMembershipIllustration() {
    const { flyingReactions, launchReaction } = useWorkshopReactionStream();
    const isReducedMotionPreferred = useReducedMotion() === true;

    useEffect(() => {
        if (isReducedMotionPreferred) {
            return;
        }

        let reactionIndex = 0;
        const launchNextReaction = () => {
            const reactionText = COMMUNITY_REACTION_SEQUENCE[reactionIndex % COMMUNITY_REACTION_SEQUENCE.length]!;
            launchReaction({
                flightId: `community-membership-${reactionIndex}-${Date.now()}`,
                reactionText,
            });
            reactionIndex += 1;
        };

        launchNextReaction();
        const intervalId = window.setInterval(launchNextReaction, REACTION_INTERVAL_MILLISECONDS);
        return () => window.clearInterval(intervalId);
    }, [isReducedMotionPreferred, launchReaction]);

    return (
        <figure
            className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#071b27] p-3 shadow-2xl shadow-cyan-950/30 sm:p-5"
            aria-label="Ukázka diskuze, materiálů a reakcí v komunitě Promptbooku"
        >
            <div className="relative min-h-[410px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#0d2a37] to-[#071923] p-4 sm:min-h-[450px] sm:p-6">
                <WorkshopReactionStream reactions={flyingReactions} className="z-20" />

                <div className="flex items-center justify-between border-b border-white/10 pb-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/20">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Komunita Promptbooku</p>
                            <p className="text-xs text-cyan-100/55">vývoj · tvorba · podnikání</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200 ring-1 ring-emerald-200/20">
                        <Users className="h-3.5 w-3.5" /> aktivní
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    <div className="mr-8 rounded-2xl rounded-tl-md bg-white/[0.07] p-4 ring-1 ring-white/10">
                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
                            <span className="h-2 w-2 rounded-full bg-cyan-300" /> Andrea · tvůrkyně
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-200">
                            Sdílím první verzi svého AI workflow. Co byste zjednodušili před nasazením?
                        </p>
                    </div>

                    <div className="ml-8 rounded-2xl rounded-tr-md bg-cyan-300/10 p-4 ring-1 ring-cyan-200/20">
                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-100">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-300/15 font-mono text-[10px]">
                                &lt;/&gt;
                            </span>
                            Pavol · moderátor
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-100">
                            Na workshopu projdeme kontext i testy. Repo jsem připnul do materiálů.
                        </p>
                    </div>

                    <div className="mr-14 flex items-start gap-3 rounded-2xl rounded-tl-md bg-white/[0.055] p-4 ring-1 ring-white/10">
                        <MessageCircleMore className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                        <p className="text-sm leading-relaxed text-slate-300">
                            Super, přidám dotaz předem. <span aria-hidden="true">🔥</span>
                        </p>
                    </div>
                </div>

                <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a202b]/90 p-3 backdrop-blur sm:inset-x-6 sm:bottom-6">
                    {COMMUNITY_REACTION_SEQUENCE.map((reaction) => (
                        <span
                            key={reaction}
                            className="flex h-9 min-w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 text-base text-white"
                        >
                            {reaction}
                        </span>
                    ))}
                </div>
            </div>
        </figure>
    );
}
