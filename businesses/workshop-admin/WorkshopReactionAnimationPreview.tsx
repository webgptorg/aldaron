'use client';

import { useWorkshopReactionStream } from '@/components/workshops/useWorkshopReactionStream';
import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import {
    getAnimatedWorkshopReactions,
    getWorkshopReactionAnimation,
    normalizeWorkshopReactionText,
} from '@/lib/workshops/workshopReactionAnimations';
import { Play } from 'lucide-react';
import { useRef } from 'react';

/**
 * How long the preview waits between two reactions of one whole run, so that they do not cover each other
 */
const PREVIEW_REACTION_DELAY_MILLISECONDS = 220;

type WorkshopReactionAnimationPreviewProps = {
    /**
     * The reactions this workshop offers, exactly as the administration has them written down right now
     */
    readonly reactions: readonly string[];
};

type WorkshopReactionButtonProps = {
    readonly reaction: string;
    readonly onPlay: (reaction: string) => void;
};

function WorkshopReactionButton({ reaction, onPlay }: WorkshopReactionButtonProps) {
    const { adminLabel } = getWorkshopReactionAnimation(reaction);

    return (
        <button
            type="button"
            onClick={() => onPlay(reaction)}
            title={`Přehrát animaci: ${adminLabel}`}
            className="flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
            <span className="text-xl leading-none">{reaction}</span>
            <span className="text-[10px] leading-tight text-slate-500">{adminLabel}</span>
        </button>
    );
}

/**
 * Shows the administration how each reaction of a workshop celebrates in the room
 *
 * Note: The preview flies the reactions through the very same stream and the very same stylesheet as the room, so what
 *       an admin sees here is what a participant sees, and neither of them has an animation of its own.
 */
export function WorkshopReactionAnimationPreview({ reactions }: WorkshopReactionAnimationPreviewProps) {
    const { flyingReactions, launchReaction } = useWorkshopReactionStream();
    const previewFlightCountRef = useRef(0);

    // A half-written list of reactions may hold the same one twice, which is worth previewing only once.
    const previewedReactions = Array.from(new Set(reactions));
    const configuredReactionTexts = new Set(previewedReactions.map(normalizeWorkshopReactionText));
    const unusedAnimatedReactions = getAnimatedWorkshopReactions().filter(
        (reaction) => !configuredReactionTexts.has(normalizeWorkshopReactionText(reaction)),
    );

    const playReaction = (reactionText: string) => {
        previewFlightCountRef.current += 1;
        launchReaction({ flightId: `preview-${previewFlightCountRef.current}`, reactionText });
    };

    const playAllReactions = () => {
        previewedReactions.forEach((reaction, reactionIndex) => {
            window.setTimeout(() => playReaction(reaction), reactionIndex * PREVIEW_REACTION_DELAY_MILLISECONDS);
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Náhled animací reakcí</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Klikněte na reakci a uvidíte, jak proletí místností. Reakce bez vlastní animace použijí obecnou.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={playAllReactions}
                    disabled={previewedReactions.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-50"
                >
                    <Play className="h-3.5 w-3.5" /> Přehrát vše
                </button>
            </div>

            <div className="relative mt-3 h-64 overflow-hidden rounded-lg bg-[#081a24]">
                <WorkshopReactionStream reactions={flyingReactions} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {previewedReactions.map((reaction) => (
                    <WorkshopReactionButton key={reaction} reaction={reaction} onPlay={playReaction} />
                ))}
            </div>

            {unusedAnimatedReactions.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-medium text-slate-500">
                        Vlastní animaci mají i tyto reakce, které tento workshop zatím nenabízí:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {unusedAnimatedReactions.map((reaction) => (
                            <WorkshopReactionButton key={reaction} reaction={reaction} onPlay={playReaction} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
