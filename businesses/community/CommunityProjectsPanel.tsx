'use client';

import { MOCK_COMMUNITY_PROJECTS, type CommunityProject } from '@/businesses/community/communityProjects';
import { Button } from '@/components/ui/button';
import { ExternalLink, FolderKanban, Plus, Send, Sparkles, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const PROJECT_CATEGORIES = ['AI a produktivita', 'Web a data', 'Tvorba a obsah', 'Jiné'];
const NEW_PROJECT_ACCENT_CLASS_NAME = 'from-emerald-300/30 to-teal-500/10';

type CommunityProjectFormValues = Pick<CommunityProject, 'title' | 'description' | 'authorName' | 'category' | 'url'>;

const EMPTY_PROJECT_FORM: CommunityProjectFormValues = {
    title: '',
    description: '',
    authorName: '',
    category: PROJECT_CATEGORIES[0],
    url: '',
};

function CommunityProjectCard({ project }: { readonly project: CommunityProject }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a202b] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-cyan-200/30">
            <div className={`h-2 bg-gradient-to-r ${project.accentClassName}`} />
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-cyan-200/80">{project.category}</span>
                        <h3 className="mt-1 break-words text-lg font-bold text-white">{project.title}</h3>
                    </div>
                    <FolderKanban className="mt-1 h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{project.description}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="min-w-0 truncate text-xs text-slate-400" title={project.authorName}>
                        Od {project.authorName}
                    </span>
                    <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                    >
                        Otevřít <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </article>
    );
}

export function CommunityProjectsPanel() {
    const [projects, setProjects] = useState<readonly CommunityProject[]>(MOCK_COMMUNITY_PROJECTS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formValues, setFormValues] = useState<CommunityProjectFormValues>(EMPTY_PROJECT_FORM);

    function updateFormValue(field: keyof CommunityProjectFormValues, value: string) {
        setFormValues((currentFormValues) => ({ ...currentFormValues, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const project: CommunityProject = {
            ...formValues,
            id: `mock-project-${Date.now()}`,
            accentClassName: NEW_PROJECT_ACCENT_CLASS_NAME,
        };
        setProjects((currentProjects) => [project, ...currentProjects]);
        setFormValues(EMPTY_PROJECT_FORM);
        setIsFormOpen(false);
    }

    return (
        <section className="mt-4 rounded-2xl border border-cyan-200/15 bg-gradient-to-br from-cyan-300/[0.08] to-white/[0.025] p-4 sm:p-5" aria-labelledby="community-projects-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden="true" />
                        <h2 id="community-projects-title" className="text-lg font-bold text-white">Projekty a vlastní tvorba</h2>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                        Ukažte ostatním, na čem pracujete, co jste vytvořili nebo co byste rádi získali jako zpětnou vazbu.
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={() => setIsFormOpen((isCurrentlyOpen) => !isCurrentlyOpen)}
                    className="shrink-0 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                >
                    {isFormOpen ? <X className="mr-2 h-4 w-4" aria-hidden="true" /> : <Plus className="mr-2 h-4 w-4" aria-hidden="true" />}
                    {isFormOpen ? 'Zavřít formulář' : 'Sdílet projekt'}
                </Button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-cyan-200/15 bg-[#071820]/80 p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-slate-200">
                            Název projektu
                            <input required value={formValues.title} onChange={(event) => updateFormValue('title', event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 font-normal text-white outline-none focus:border-cyan-200" />
                        </label>
                        <label className="text-sm font-semibold text-slate-200">
                            Vaše jméno
                            <input required value={formValues.authorName} onChange={(event) => updateFormValue('authorName', event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 font-normal text-white outline-none focus:border-cyan-200" />
                        </label>
                        <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
                            Krátký popis
                            <textarea required rows={3} value={formValues.description} onChange={(event) => updateFormValue('description', event.target.value)} className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 font-normal text-white outline-none focus:border-cyan-200" />
                        </label>
                        <label className="text-sm font-semibold text-slate-200">
                            Kategorie
                            <select value={formValues.category} onChange={(event) => updateFormValue('category', event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-[#102833] px-3 py-2.5 font-normal text-white outline-none focus:border-cyan-200">
                                {PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-slate-200">
                            Odkaz
                            <input required type="url" value={formValues.url} onChange={(event) => updateFormValue('url', event.target.value)} placeholder="https://…" className="mt-2 w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 font-normal text-white outline-none focus:border-cyan-200" />
                        </label>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">Demo režim: sdílení se zatím zobrazí jen v této návštěvě.</p>
                        <Button type="submit" className="bg-emerald-300 text-slate-950 hover:bg-emerald-200">
                            <Send className="mr-2 h-4 w-4" aria-hidden="true" /> Publikovat ukázku
                        </Button>
                    </div>
                </form>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => <CommunityProjectCard key={project.id} project={project} />)}
            </div>
        </section>
    );
}
