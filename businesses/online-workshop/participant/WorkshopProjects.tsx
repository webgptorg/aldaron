'use client';

import type { WorkshopProjectValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    MAXIMAL_WORKSHOP_PROJECT_DESCRIPTION_LENGTH,
    MAXIMAL_WORKSHOP_PROJECT_TITLE_LENGTH,
    MAXIMAL_WORKSHOP_PROJECT_URL_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { getWorkshopProjectLinkLabel, getWorkshopProjectStatusLabel } from '@/lib/workshops/workshopProjectStatus';
import type { WorkshopProject } from '@/lib/workshops/workshopTypes';
import { ExternalLink, FolderKanban, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopProjectsProps = {
    readonly projects: readonly WorkshopProject[];
    readonly isInteractionBanned: boolean;
    readonly onSubmit: (values: WorkshopProjectValues) => Promise<boolean>;
};

function getProjectStatusClassName(project: WorkshopProject): string {
    switch (project.status) {
        case 'approved':
            return 'border-emerald-300/25 bg-emerald-300/[0.10] text-emerald-100';
        case 'rejected':
            return 'border-rose-300/25 bg-rose-300/[0.10] text-rose-100';
        case 'pending':
            return 'border-amber-300/25 bg-amber-300/[0.10] text-amber-100';
    }
}

/**
 * The member-facing project gallery of a room. It receives the same small, authenticated state shape as the chat;
 * pending projects can therefore be shown only to their own author without ever placing a participant ID in the DOM.
 */
export function WorkshopProjects({ projects, isInteractionBanned, onSubmit }: WorkshopProjectsProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setFormError('Napište název projektu nebo výtvoru.');
            return;
        }

        setFormError(null);
        setIsSubmitting(true);
        try {
            const isSubmitted = await onSubmit({
                title: trimmedTitle,
                description: description.trim(),
                url: url.trim() || null,
            });
            if (isSubmitted) {
                setTitle('');
                setDescription('');
                setUrl('');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section
            aria-label="Projekty a výtvory komunity"
            className="overflow-hidden rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-300/[0.11] to-slate-950/20 shadow-lg shadow-violet-950/10"
        >
            <div className="border-b border-white/[0.08] px-5 py-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
                    <FolderKanban className="h-4 w-4" /> Tvorba komunity
                </p>
                <h2 className="mt-2 text-lg font-bold leading-6 text-white">Projekty a výtvory</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                    Ukažte ostatním, na čem pracujete nebo co jste vytvořili. Přidejte krátký kontext a případně odkaz,
                    kde si mohou výsledek prohlédnout.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 border-b border-white/[0.08] bg-slate-950/20 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-100">
                        Název
                        <Input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            maxLength={MAXIMAL_WORKSHOP_PROJECT_TITLE_LENGTH}
                            required
                            disabled={isInteractionBanned || isSubmitting}
                            placeholder="Například: Pomocník pro plánování zahrady"
                            className="mt-1.5 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                        />
                    </label>
                    <label className="block text-sm font-medium text-slate-100">
                        Odkaz <span className="font-normal text-slate-400">(volitelný)</span>
                        <Input
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            maxLength={MAXIMAL_WORKSHOP_PROJECT_URL_LENGTH}
                            disabled={isInteractionBanned || isSubmitting}
                            placeholder="https://…"
                            className="mt-1.5 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                        />
                    </label>
                </div>
                <label className="block text-sm font-medium text-slate-100">
                    O čem to je <span className="font-normal text-slate-400">(volitelné)</span>
                    <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={MAXIMAL_WORKSHOP_PROJECT_DESCRIPTION_LENGTH}
                        disabled={isInteractionBanned || isSubmitting}
                        placeholder="Co jste vytvořili, pro koho to je a co vás na tom těší?"
                        className="mt-1.5 min-h-24 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                    />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-xl text-xs leading-5 text-slate-400">
                        Po odeslání se příspěvek objeví zde. Dokud čeká na schválení, uvidíte jej pouze vy.
                    </p>
                    <Button
                        type="submit"
                        disabled={isInteractionBanned || isSubmitting}
                        className="bg-violet-300 text-slate-950 hover:bg-violet-200"
                    >
                        <Send className="mr-2 h-4 w-4" /> {isSubmitting ? 'Sdílím…' : 'Sdílet projekt'}
                    </Button>
                </div>
                {isInteractionBanned ? (
                    <p className="text-sm text-rose-200">Pro tento účet nejsou interakce dostupné.</p>
                ) : null}
                {formError !== null ? <p className="text-sm text-rose-200">{formError}</p> : null}
            </form>

            <div className="space-y-3 p-4 sm:p-5">
                {projects.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/15 bg-slate-950/20 px-4 py-4 text-sm leading-6 text-slate-400">
                        Zatím tu není žádný schválený projekt. Buďte první, kdo ukáže, co vytvořil.
                    </p>
                ) : (
                    projects.map((project) => (
                        <article key={project.id} className="rounded-xl border border-white/[0.10] bg-slate-950/30 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="break-words font-semibold text-white">{project.title}</h3>
                                    <p className="mt-1 text-sm text-slate-400">Sdílí {project.authorName}</p>
                                </div>
                                {project.isAuthoredByParticipant && project.status !== 'approved' ? (
                                    <span
                                        className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getProjectStatusClassName(project)}`}
                                    >
                                        {getWorkshopProjectStatusLabel(project.status)}
                                    </span>
                                ) : null}
                            </div>
                            {project.description ? (
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                    {project.description}
                                </p>
                            ) : null}
                            {project.url !== null ? (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-violet-300/25 bg-violet-300/[0.10] px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/[0.16]"
                                >
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        Otevřít · {getWorkshopProjectLinkLabel(project.url)}
                                    </span>
                                </a>
                            ) : null}
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
