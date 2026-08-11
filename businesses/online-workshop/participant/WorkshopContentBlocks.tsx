'use client';

import { MarkdownContent } from '@/components/markdown-content';
import type { WorkshopContentBlock } from '@/lib/workshop/workshopTypes';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type WorkshopContentBlocksProps = {
    readonly contentBlocks: readonly WorkshopContentBlock[];
};

/**
 * The materials of the workshop, each one shown from the moment it was unlocked
 *
 * Note: The list is whatever the server answered a moment ago, so a block added, changed or taken away during the
 *       workshop appears, changes or disappears here without anybody reloading anything.
 */
export function WorkshopContentBlocks({ contentBlocks }: WorkshopContentBlocksProps) {
    const newlyUnlockedBlockIds = useNewlyUnlockedBlockIds(contentBlocks);

    if (contentBlocks.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                <Lock className="mx-auto h-7 w-7 text-white/30" />
                <p className="mt-3 text-base font-semibold text-white">Materiály se odemknou během workshopu</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/50">
                    Odkazy, prompty a poznámky sem přidáváme postupně. Objeví se tu samy, stránku není potřeba
                    obnovovat.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {contentBlocks.map((contentBlock) => (
                <motion.article
                    key={contentBlock.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 sm:p-6"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{contentBlock.title}</h3>
                        {newlyUnlockedBlockIds.has(contentBlock.id) && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200">
                                <Sparkles className="h-3.5 w-3.5" />
                                Právě odemčeno
                            </span>
                        )}
                    </div>

                    <div className="workshop-markdown mt-4 text-[15px] leading-relaxed text-white/80">
                        <MarkdownContent content={contentBlock.contentMarkdown} theme="DARK" />
                    </div>
                </motion.article>
            ))}
        </div>
    );
}

/**
 * Which blocks appeared only after the participant had already connected
 *
 * Note: Everything which was already there when the page opened is simply the content of the workshop, only what
 *       arrives later deserves to be pointed out.
 */
function useNewlyUnlockedBlockIds(contentBlocks: readonly WorkshopContentBlock[]): ReadonlySet<number> {
    const alreadyKnownBlockIdsRef = useRef<ReadonlySet<number> | null>(null);
    const [newlyUnlockedBlockIds, setNewlyUnlockedBlockIds] = useState<ReadonlySet<number>>(new Set());

    useEffect(() => {
        const currentBlockIds = contentBlocks.map((contentBlock) => contentBlock.id);

        if (alreadyKnownBlockIdsRef.current === null) {
            alreadyKnownBlockIdsRef.current = new Set(currentBlockIds);
            return;
        }

        const alreadyKnownBlockIds = alreadyKnownBlockIdsRef.current;
        const arrivedBlockIds = currentBlockIds.filter((blockId) => !alreadyKnownBlockIds.has(blockId));

        if (arrivedBlockIds.length === 0) {
            return;
        }

        alreadyKnownBlockIdsRef.current = new Set([...Array.from(alreadyKnownBlockIds), ...arrivedBlockIds]);
        setNewlyUnlockedBlockIds((previousIds) => new Set([...Array.from(previousIds), ...arrivedBlockIds]));
    }, [contentBlocks]);

    return newlyUnlockedBlockIds;
}
