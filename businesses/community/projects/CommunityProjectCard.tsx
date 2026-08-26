'use client';

import { createCommunityProjectPath } from '@/businesses/community/config';
import { CommunityProjectPreviewImage } from '@/businesses/community/projects/CommunityProjectPreviewImage';
import { CommunityProjectVoting } from '@/businesses/community/projects/CommunityProjectVoting';
import type { CommunityProject, CommunityProjectVote } from '@/lib/community-projects/communityProjectTypes';
import { ExternalLink, MessageCircle } from 'lucide-react';
import Link from 'next/link';

type CommunityProjectCardProps = {
    readonly project: CommunityProject;
    readonly isVoting: boolean;
    readonly onVote: (projectId: string, vote: CommunityProjectVote) => Promise<void>;
};

function getProjectHost(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export function CommunityProjectCard({ project, isVoting, onVote }: CommunityProjectCardProps) {
    return (
        <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b202b] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:shadow-cyan-950/30">
            <Link href={createCommunityProjectPath(project.id)} className="block aspect-[16/9] overflow-hidden bg-slate-900">
                <CommunityProjectPreviewImage
                    imageUrl={project.previewImageUrl}
                    title={project.title}
                    className="transition duration-300 group-hover:scale-[1.03]"
                />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col p-4">
                <p className="truncate text-xs font-medium text-cyan-200/80">{getProjectHost(project.url)}</p>
                <Link href={createCommunityProjectPath(project.id)} className="mt-1.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-cyan-300">
                    <h3 className="line-clamp-2 text-base font-bold leading-snug text-white transition group-hover:text-cyan-200">
                        {project.title}
                    </h3>
                </Link>
                <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-400">{project.description || 'Autor zatím nepřidal popis projektu.'}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <CommunityProjectVoting
                        upvoteCount={project.upvoteCount}
                        downvoteCount={project.downvoteCount}
                        voteByParticipant={project.voteByParticipant}
                        isVoting={isVoting}
                        onVote={(vote) => onVote(project.id, vote)}
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Link
                            href={createCommunityProjectPath(project.id)}
                            className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-slate-300 hover:text-cyan-200"
                        >
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Diskuze
                        </Link>
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-slate-300 hover:text-cyan-200"
                        >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Otevřít
                        </a>
                    </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Sdílí {project.authorName}</p>
            </div>
        </article>
    );
}
