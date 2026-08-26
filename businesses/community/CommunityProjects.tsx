'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CommunityProject, CommunityProjectPreview } from '@/lib/community/communityProjects';
import { MOCK_COMMUNITY_PROJECTS } from '@/lib/community/communityProjects';
import { requestJson } from '@/lib/api/requestJson';
import { ArrowDown, ArrowUp, ExternalLink, Globe, LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';

type ProjectPreviewResponse = CommunityProjectPreview;

const EMPTY_PREVIEW: ProjectPreviewResponse = { url: '', title: '', description: '', imageUrl: null };

function ProjectCard({ project, voteDirection, onVote }: { project: CommunityProject; voteDirection: 1 | -1 | 0; onVote: (id: string, direction: 1 | -1) => void }) {
    return (
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-lg transition hover:border-cyan-300/40">
            <a href={project.url} target="_blank" rel="noreferrer" className="group block">
                <div className="relative aspect-[2/1] overflow-hidden bg-slate-800">
                    {project.imageUrl ? (
                        // The URL is metadata supplied by the project page; a regular img supports arbitrary OG hosts.
                        <img src={project.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : <div className="h-full bg-gradient-to-br from-cyan-400/40 via-blue-500/20 to-slate-900" />}
                    <span className="absolute right-3 top-3 rounded-full bg-slate-950/70 p-2 text-cyan-200 backdrop-blur"><ExternalLink className="h-4 w-4" /></span>
                </div>
            </a>
            <div className="flex gap-3 p-4">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <button type="button" aria-label={`Hlasovat pro ${project.title}`} aria-pressed={voteDirection === 1} onClick={() => onVote(project.id, 1)} className={`rounded-md p-1 hover:bg-cyan-300/15 hover:text-cyan-200 ${voteDirection === 1 ? 'text-cyan-300' : ''}`}><ArrowUp className="h-5 w-5" /></button>
                    <span className="text-sm font-bold text-white">{project.score}</span>
                    <button type="button" aria-label={`Hlasovat proti ${project.title}`} aria-pressed={voteDirection === -1} onClick={() => onVote(project.id, -1)} className={`rounded-md p-1 hover:bg-rose-300/15 hover:text-rose-200 ${voteDirection === -1 ? 'text-rose-300' : ''}`}><ArrowDown className="h-5 w-5" /></button>
                </div>
                <div className="min-w-0">
                    <h3 className="truncate font-bold text-white">{project.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{project.description}</p>
                    <p className="mt-3 text-xs text-slate-500">od {project.author}</p>
                </div>
            </div>
        </article>
    );
}

export function CommunityProjects() {
    const [projects, setProjects] = useState<CommunityProject[]>([...MOCK_COMMUNITY_PROJECTS]);
    const [voteDirections, setVoteDirections] = useState<Record<string, 1 | -1 | 0>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState<1 | 2>(1);
    const [url, setUrl] = useState('');
    const [preview, setPreview] = useState<ProjectPreviewResponse>(EMPTY_PREVIEW);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function resetWizard() {
        setWizardStep(1); setUrl(''); setPreview(EMPTY_PREVIEW); setErrorMessage(null);
    }

    async function loadPreview() {
        setErrorMessage(null); setIsLoadingPreview(true);
        try {
            const loadedPreview = await requestJson<ProjectPreviewResponse>('/api/community/projects/preview', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
            }, 'Náhled se nepodařilo načíst');
            setPreview(loadedPreview); setWizardStep(2);
        } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Náhled se nepodařilo načíst.'); }
        finally { setIsLoadingPreview(false); }
    }

    function createProject() {
        setProjects((currentProjects) => [{ ...preview, id: `mock-${Date.now()}`, author: 'Vy', score: 1, createdAt: new Date().toISOString() }, ...currentProjects]);
        setIsDialogOpen(false); resetWizard();
    }

    function vote(id: string, direction: 1 | -1) {
        const previousDirection = voteDirections[id] ?? 0;
        const nextDirection = previousDirection === direction ? 0 : direction;
        setProjects((currentProjects) => currentProjects.map((project) => project.id === id ? { ...project, score: project.score + nextDirection - previousDirection } : project));
        setVoteDirections((currentDirections) => ({ ...currentDirections, [id]: nextDirection }));
    }

    return (
        <section className="mb-5 rounded-2xl border border-cyan-300/15 bg-[#071b25] p-4 shadow-xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Tvoříme spolu</p><h2 className="mt-1 text-2xl font-bold text-white">Projekty komunity</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Inspirujte ostatní tím, co jste vytvořili s AI. Hlasujte pro projekty, které stojí za pozornost.</p></div>
                <button type="button" onClick={() => setIsDialogOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"><Plus className="h-4 w-4" /> Přidat projekt</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} voteDirection={voteDirections[project.id] ?? 0} onVote={vote} />)}</div>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetWizard(); }}>
                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-700 bg-[#0b202b] text-slate-200 sm:max-w-xl">
                    <DialogHeader><DialogTitle className="text-white">Sdílet projekt</DialogTitle><DialogDescription className="text-slate-400">{wizardStep === 1 ? 'Začněte adresou projektu. Náhled načteme automaticky.' : 'Zkontrolujte údaje, případně je upravte před zveřejněním.'}</DialogDescription></DialogHeader>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><span className={wizardStep === 1 ? 'font-bold text-cyan-300' : ''}>1 URL projektu</span><span>→</span><span className={wizardStep === 2 ? 'font-bold text-cyan-300' : ''}>2 Údaje projektu</span></div>
                    {wizardStep === 1 ? <div className="space-y-4"><label className="block text-sm font-semibold text-slate-200">URL projektu<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://muj-projekt.cz" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none ring-cyan-300 focus:ring-2" autoFocus /></label>{errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}<DialogFooter><button type="button" onClick={loadPreview} disabled={isLoadingPreview || !url.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{isLoadingPreview && <LoaderCircle className="h-4 w-4 animate-spin" />} Načíst náhled</button></DialogFooter></div> : <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">{preview.imageUrl ? <img src={preview.imageUrl} alt="Náhled projektu" className="h-36 w-full object-cover" /> : <div className="h-36 bg-gradient-to-br from-cyan-400/30 to-slate-900" />}<p className="truncate px-3 py-2 text-xs text-slate-500">{preview.url}</p></div><label className="block text-sm font-semibold">Název<input value={preview.title} onChange={(event) => setPreview({ ...preview, title: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-300" /></label><label className="block text-sm font-semibold">Popis<textarea value={preview.description} onChange={(event) => setPreview({ ...preview, description: event.target.value })} rows={3} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-300" /></label><DialogFooter><button type="button" onClick={() => setWizardStep(1)} className="rounded-xl px-4 py-2.5 text-slate-300 hover:bg-white/10">Zpět</button><button type="button" onClick={createProject} disabled={!preview.title.trim()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 font-bold text-slate-950 disabled:opacity-50"><Globe className="h-4 w-4" /> Zveřejnit projekt</button></DialogFooter></div>}
                </DialogContent>
            </Dialog>
        </section>
    );
}
