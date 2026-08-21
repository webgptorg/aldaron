'use client';

import { MarkdownContent } from '@/components/markdown-content';
import { createWorkshopMaterialTrackingUrl } from '@/lib/workshops/workshopMaterialLinks';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, ExternalLink, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';

type WorkshopContentProps = {
    readonly workshopSlug: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
    readonly newlyUnlockedContentBlockIds: ReadonlySet<string>;
    readonly onMaterialLinkClick: (contentId: string) => void;
    readonly title?: string;
};

type WorkshopMaterialBodyProps = {
    readonly workshopSlug: string;
    readonly contentBlock: WorkshopContentBlock;
    readonly onMaterialLinkClick: (contentId: string) => void;
};

type WorkshopMaterialLink = {
    readonly href: string;
    readonly label: string;
};

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Prague',
});
const MATERIAL_CALL_TO_ACTION_LABEL = 'Otevřít materiál';
const MATERIAL_LINK_SELECTOR = 'a[href]:not([data-workshop-material-call-to-action])';

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

function getSingleWorkshopMaterialLink(linkElements: readonly HTMLAnchorElement[]): WorkshopMaterialLink | null {
    if (linkElements.length !== 1) {
        return null;
    }

    const [linkElement] = linkElements;
    return {
        href: linkElement.href,
        label: linkElement.textContent?.trim() || MATERIAL_CALL_TO_ACTION_LABEL,
    };
}

function areWorkshopMaterialLinksEqual(
    currentMaterialLink: WorkshopMaterialLink | null,
    nextMaterialLink: WorkshopMaterialLink | null,
): boolean {
    return (
        currentMaterialLink?.href === nextMaterialLink?.href &&
        currentMaterialLink?.label === nextMaterialLink?.label
    );
}

function WorkshopMaterialBody({ workshopSlug, contentBlock, onMaterialLinkClick }: WorkshopMaterialBodyProps) {
    const materialBodyReference = useRef<HTMLDivElement>(null);
    const [singleMaterialLink, setSingleMaterialLink] = useState<WorkshopMaterialLink | null>(null);

    useEffect(() => {
        const materialBodyElement = materialBodyReference.current;
        if (materialBodyElement === null) {
            return;
        }

        const configureMaterialLinks = () => {
            const linkElements = Array.from(materialBodyElement.querySelectorAll<HTMLAnchorElement>(MATERIAL_LINK_SELECTOR));
            linkElements.forEach((linkElement) => {
                configureMaterialLink(linkElement, workshopSlug, contentBlock.id);
            });

            const nextSingleMaterialLink = getSingleWorkshopMaterialLink(linkElements);
            setSingleMaterialLink((currentMaterialLink) =>
                areWorkshopMaterialLinksEqual(currentMaterialLink, nextSingleMaterialLink)
                    ? currentMaterialLink
                    : nextSingleMaterialLink,
            );
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

        const linkElement = event.target.closest(MATERIAL_LINK_SELECTOR);
        if (linkElement !== null && materialBodyReference.current?.contains(linkElement)) {
            onMaterialLinkClick(contentBlock.id);
        }
    };

    return (
        <div ref={materialBodyReference} onClickCapture={handleMaterialLinkClick} className="min-w-0 break-words">
            <MarkdownContent
                content={contentBlock.bodyMarkdown}
                theme="DARK"
                className="max-w-none leading-7 text-slate-200 [--chat-md-link-color:#f1f5f9] [&_a]:font-semibold [&_code]:break-words [&_code]:text-cyan-100 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
            />
            {singleMaterialLink && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                        href={singleMaterialLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onMaterialLinkClick(contentBlock.id)}
                        data-workshop-material-call-to-action
                        aria-label={`${MATERIAL_CALL_TO_ACTION_LABEL}: ${singleMaterialLink.label}`}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/10 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07151d]"
                    >
                        {MATERIAL_CALL_TO_ACTION_LABEL}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            )}
        </div>
    );
}

export function WorkshopContent({
    workshopSlug,
    contentBlocks,
    nextContentUnlockAt,
    newlyUnlockedContentBlockIds,
    onMaterialLinkClick,
    title = 'Materiály z workshopu',
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
                    {title}
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
                            className={`relative overflow-hidden rounded-2xl border bg-white/[0.045] p-5 text-slate-200 shadow-lg transition-colors sm:p-8 ${isNewlyUnlocked ? 'border-cyan-300/60 pt-16 shadow-cyan-300/10 sm:pt-8' : 'border-white/10'}`}
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
                    <div className="flex items-start gap-3 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] px-5 py-4 text-sm text-slate-400">
                        <Clock3 className="h-5 w-5 shrink-0 text-cyan-300" />
                        <span className="min-w-0">
                            Další materiál se automaticky odemkne{' '}
                            {CZECH_DATE_TIME_FORMAT.format(new Date(nextContentUnlockAt))}.
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}
