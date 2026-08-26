import { CommunityProjectPreviewImage } from '@/businesses/community/projects/CommunityProjectPreviewImage';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { ExternalLink, MessageCircle, UserRound } from 'lucide-react';

type CommunityProjectDetailsPanelProps = {
    readonly project: CommunityProject;
};

function getProjectHost(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

/**
 * The broad column of a project discussion keeps the project itself visible while the shared workshop chat occupies
 * the narrow familiar discussion column beside it.
 */
export function CommunityProjectDetailsPanel({ project }: CommunityProjectDetailsPanelProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b202b] shadow-xl shadow-black/10">
            <div className="aspect-[16/8] bg-slate-950">
                <CommunityProjectPreviewImage imageUrl={project.previewImageUrl} title={project.title} />
            </div>
            <div className="p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{getProjectHost(project.url)}</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{project.title}</h1>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {project.description || 'Autor zatím nepřidal podrobnější popis projektu.'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                        <UserRound className="h-4 w-4 text-cyan-200" /> Sdílí {project.authorName}
                    </span>
                    <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                    >
                        <ExternalLink className="h-4 w-4" /> Otevřít projekt
                    </a>
                </div>
                <p className="mt-5 flex items-center gap-2 text-sm text-slate-400">
                    <MessageCircle className="h-4 w-4 text-cyan-300" /> Diskuze je vpravo; autor projektu ji moderuje.
                </p>
            </div>
        </section>
    );
}
