'use client';

import type { CommunityProject } from '@/lib/communityProjects';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowDown, ArrowUp, ExternalLink, Plus } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PROJECT_PREVIEW_COUNT = 5;

function ProjectCard({ project, participantIdentity }: { readonly project: CommunityProject; readonly participantIdentity?: { readonly email: string; readonly fullname: string } }) {
    const [upvoteCount, setUpvoteCount] = useState(project.upvoteCount);
    const [downvoteCount, setDownvoteCount] = useState(project.downvoteCount);
    const vote = async (value: 1 | -1) => {
        const response = await fetch(`/api/community/projects/${project.id}/votes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vote: value }) });
        if (!response.ok) return;
        const result = await response.json() as { upvote_count?: number; downvote_count?: number };
        if (typeof result.upvote_count === 'number') setUpvoteCount(result.upvote_count);
        if (typeof result.downvote_count === 'number') setDownvoteCount(result.downvote_count);
    };
    const discussionUrl = new URL(`/cs/komunita/projects/${project.id}`, 'https://promptbook.com');
    if (participantIdentity) { discussionUrl.searchParams.set('email', participantIdentity.email); discussionUrl.searchParams.set('fullname', participantIdentity.fullname); }
    return <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1c26] shadow-xl">
        <a href={project.url} target="_blank" rel="noreferrer" className="block aspect-[16/9] bg-slate-900">
            {project.ogImageUrl ? <img src={project.ogImageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-cyan-300">✦</div>}
        </a>
        <div className="p-4"><h3 className="line-clamp-2 font-bold text-white">{project.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-400">{project.description}</p>
            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500"><span>od {project.authorName}</span><div className="flex items-center gap-1"><button aria-label="Líbí se" onClick={() => void vote(1)} className="rounded p-1 hover:bg-emerald-400/20 hover:text-emerald-300"><ArrowUp className="h-4 w-4" /></button><span>{upvoteCount - downvoteCount}</span><button aria-label="Nelíbí se" onClick={() => void vote(-1)} className="rounded p-1 hover:bg-rose-400/20 hover:text-rose-300"><ArrowDown className="h-4 w-4" /></button><Link href={discussionUrl.pathname + discussionUrl.search} className="ml-2 rounded p-1 hover:bg-white/10" aria-label="Otevřít diskusi"><ExternalLink className="h-4 w-4" /></Link></div></div>
        </div></article>;
}

export function CommunityProjectsPanel({ projects, participantIdentity }: { readonly projects: readonly CommunityProject[]; readonly participantIdentity?: { readonly email: string; readonly fullname: string } }) {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [url, setUrl] = useState(''); const [preview, setPreview] = useState<{ title: string; description: string; ogImageUrl: string | null } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); const router = useRouter();
    const loadPreview = async () => { setErrorMessage(null); const response = await fetch('/api/community/projects/preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) }); const result = await response.json() as { error?: string; title?: string; description?: string; ogImageUrl?: string | null }; if (!response.ok) { setErrorMessage(result.error ?? 'Náhled se nepodařilo načíst.'); return; } setPreview({ title: result.title ?? url, description: result.description ?? '', ogImageUrl: result.ogImageUrl ?? null }); };
    const createProject = async () => { if (!preview) return; const response = await fetch('/api/community/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url, ...preview }) }); if (!response.ok) { const result = await response.json() as { error?: string }; setErrorMessage(result.error ?? 'Projekt se nepodařilo uložit.'); return; } setIsWizardOpen(false); router.refresh(); };
    return <section className="mt-8"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-white">Projekty komunity</h2><p className="text-sm text-slate-500">Co vytvořili členové Promptbooku</p></div><button onClick={() => { setPreview(null); setErrorMessage(null); setIsWizardOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"><Plus className="h-4 w-4" /> Sdílet projekt</button></div>
        {projects.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">Zatím tu žádné projekty nejsou. Buďte první.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.slice(0, PROJECT_PREVIEW_COUNT).map((project) => <ProjectCard key={project.id} project={project} participantIdentity={participantIdentity} />)}{projects.length >= PROJECT_PREVIEW_COUNT && <Link href="/cs/komunita/projects" className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-300/5 font-bold text-cyan-200 hover:bg-cyan-300/10">Zobrazit všechny projekty →</Link>}</div>}
        <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}><DialogContent><DialogHeader><DialogTitle>{preview ? 'Dolaďte projekt' : 'Sdílet projekt'}</DialogTitle><DialogDescription>{preview ? 'Zkontrolujte údaje, které jsme načetli z webu.' : 'Vložte odkaz na stránku projektu.'}</DialogDescription></DialogHeader>{!preview ? <div className="space-y-4"><label className="block text-sm font-medium">URL<input autoFocus value={url} onChange={(event) => setUrl(event.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="https://…" /></label><button onClick={() => void loadPreview()} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Načíst náhled</button></div> : <div className="space-y-4"><label className="block text-sm font-medium">Název<input value={preview.title} onChange={(event) => setPreview({ ...preview, title: event.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="block text-sm font-medium">Popis<textarea value={preview.description} onChange={(event) => setPreview({ ...preview, description: event.target.value })} className="mt-1 min-h-24 w-full rounded-md border bg-background px-3 py-2" /></label><button onClick={() => void createProject()} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Publikovat projekt</button></div>}{errorMessage && <p className="text-sm text-rose-500">{errorMessage}</p>}</DialogContent></Dialog>
    </section>;
}
