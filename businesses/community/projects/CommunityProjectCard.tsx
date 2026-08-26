'use client';

import { CZECH_COMMUNITY_LOCALE, CZECH_COMMUNITY_TIME_ZONE } from '@/businesses/community/communityContent';
import { Button } from '@/components/ui/button';
import { getCommunityProjectCategoryDefinition } from '@/lib/community/communityProjectCategories';
import type { CommunityProject } from '@/lib/community/communityProjectTypes';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Heart } from 'lucide-react';

const CZECH_COMMUNITY_PROJECT_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_COMMUNITY_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: CZECH_COMMUNITY_TIME_ZONE,
});

type CommunityProjectCardProps = {
    readonly project: CommunityProject;
    readonly onToggleLike: (projectId: string) => void;
};

/**
 * One shared project as the community reads it: what it is, who made it, where to open it and how many members
 * already liked it.
 */
export function CommunityProjectCard({ project, onToggleLike }: CommunityProjectCardProps) {
    const categoryDefinition = getCommunityProjectCategoryDefinition(project.categoryKey);

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-cyan-200/30">
            <div className={cn('h-1.5 bg-gradient-to-r', categoryDefinition.accentClassName)} aria-hidden="true" />
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={cn(
                            'rounded-full border px-2.5 py-1 text-xs font-semibold',
                            categoryDefinition.badgeClassName,
                        )}
                    >
                        {categoryDefinition.label}
                    </span>
                    {project.isSharedByMember && (
                        <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                            Váš projekt
                        </span>
                    )}
                </div>

                <h3 className="mt-3 break-words text-lg font-bold leading-6 text-white">{project.title}</h3>
                <p className="mt-2 flex-1 whitespace-pre-line break-words text-sm leading-6 text-slate-400">
                    {project.description}
                </p>

                <p className="mt-4 text-xs text-slate-500">
                    {project.authorFullname} · {CZECH_COMMUNITY_PROJECT_DATE_FORMAT.format(new Date(project.sharedAt))}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-pressed={project.isLikedByMember}
                        aria-label={`Líbí se mi projekt ${project.title}`}
                        onClick={() => onToggleLike(project.id)}
                        className={cn(
                            'rounded-full px-3 hover:bg-white/5',
                            project.isLikedByMember ? 'text-rose-300 hover:text-rose-200' : 'text-slate-400 hover:text-slate-200',
                        )}
                    >
                        <Heart
                            className={cn('mr-1.5 h-4 w-4', project.isLikedByMember && 'fill-current')}
                            aria-hidden="true"
                        />
                        <span className="tabular-nums">{project.likeCount}</span>
                    </Button>
                    <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                    >
                        Otevřít projekt
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </article>
    );
}
