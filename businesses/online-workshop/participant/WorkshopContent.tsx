'use client';

import { MarkdownContent } from '@/components/markdown-content';
import { createWorkshopMaterialTrackingUrl } from '@/lib/workshops/workshopMaterialLinks';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Sparkles } from 'lucide-react';
import { useEffect, useRef, type MouseEvent } from 'react';

type WorkshopContentProps = {
    readonly workshopSlug: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
    readonly newlyUnlockedContentBlockIds: ReadonlySet<string>;
    readonly onMaterialLinkClick: (contentId: string) => void;
};

type WorkshopMaterialBodyProps = {
    readonly workshopSlug: string;
    readonly contentBlock: WorkshopContentBlock;
    readonly onMaterialLinkClick: (contentId: string) => void;
};

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Prague',
});

function configureMaterialLink(linkElement: HTMLAnchorElement, workshopSlug: string, contentBlockId: string): void {
    const originalHref = linkElement.dataset.workshopOriginalHref ?? linkElement.getAttribute('href');
    if (!originalHref) {
        return;
    }

    linkElement.dataset.workshopOriginalHref = originalHref;
    linkElement.href = createWorkshopMaterialTrackingUrl(originalHref, workshopSlug, contentBlockId);
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
}

function WorkshopMaterialBody({ workshopSlug, contentBlock, onMaterialLinkClick }: WorkshopMaterialBodyProps) {
    const materialBodyReference = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const materialBodyElement = materialBodyReference.current;
        if (materialBodyElement === null) {
            return;
        }

        const configureMaterialLinks = () => {
            materialBodyElement.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((linkElement) => {
                configureMaterialLink(linkElement, workshopSlug, contentBlock.id);
            });
        };

        configureMaterialLinks();
        const observer = new MutationObserver(configureMaterialLinks);
        observer.observe(materialBodyElement, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [contentBlock.bodyMarkdown, contentBlock.id, workshopSlug]);

    const handleMaterialLinkClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const linkElement = event.target.closest('a[href]');
        if (linkElement !== null && materialBodyReference.current?.contains(linkElement)) {
            onMaterialLinkClick(contentBlock.id);
        }
    };

    return (
        <div ref={materialBodyReference} onClickCapture={handleMaterialLinkClick}>
            <MarkdownContent
                content={contentBlock.bodyMarkdown}
                theme="DARK"
                className="max-w-none leading-7 text-slate-200 [&_a]:text-cyan-300 [&_a]:underline [&_code]:text-cyan-100 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white"
            />
        </div>
    );
}

export function WorkshopContent({
    workshopSlug,
    contentBlocks,
    nextContentUnlockAt,
    newlyUnlockedContentBlockIds,
    onMaterialLinkClick,
}: WorkshopContentProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    if (contentBlocks.length === 0 && nextContentUnlockAt === null) {
        return null;
    }

    return (
        <section className="mt-8" aria-labelledby="workshop-materials-title">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h2 id="workshop-materials-title" className="text-xl font-bold text-white">
                    Materiály z workshopu
                </h2>
            </div>

            <div className="space-y-4">
                {contentBlocks.map((contentBlock) => {
                    const isNewlyUnlocked = newlyUnlockedContentBlockIds.has(contentBlock.id);
                    return (
                        <motion.article
                            key={contentBlock.id}
                            initial={isNewlyUnlocked && !isReducedMotionPreferred ? { opacity: 0, y: 24, scale: 0.97 } : false}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: isReducedMotionPreferred ? 0 : 0.55, ease: 'easeOut' }}
                            className={`relative overflow-hidden rounded-2xl border bg-white/[0.045] p-6 text-slate-200 shadow-lg transition-colors sm:p-8 ${isNewlyUnlocked ? 'border-cyan-300/60 shadow-cyan-300/10' : 'border-white/10'}`}
                        >
                            {isNewlyUnlocked && (
                                <span className="absolute right-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg">
                                    Právě odemčeno
                                </span>
                            )}
                            {contentBlock.title && (
                                <h3 className="mb-5 text-xl font-bold text-white">{contentBlock.title}</h3>
                            )}
                            <WorkshopMaterialBody
                                workshopSlug={workshopSlug}
                                contentBlock={contentBlock}
                                onMaterialLinkClick={onMaterialLinkClick}
                            />
                        </motion.article>
                    );
                })}

                {nextContentUnlockAt && (
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] px-5 py-4 text-sm text-slate-400">
                        <Clock3 className="h-5 w-5 shrink-0 text-cyan-300" />
                        Další materiál se automaticky odemkne{' '}
                        {CZECH_DATE_TIME_FORMAT.format(new Date(nextContentUnlockAt))}.
                    </div>
                )}
            </div>
        </section>
    );
}
