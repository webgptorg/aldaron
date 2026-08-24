'use client';

import { Button } from '@/components/ui/button';
import { getWorkshopProjectLinkLabel, getWorkshopProjectStatusLabel } from '@/lib/workshops/workshopProjectStatus';
import type { WorkshopAdminProject, WorkshopProjectStatus } from '@/lib/workshops/workshopTypes';
import { Check, ExternalLink, FolderKanban, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type WorkshopProjectAdminProps = {
    readonly projects: readonly WorkshopAdminProject[];
    readonly onChangeStatus: (projectId: string, status: Exclude<WorkshopProjectStatus, 'pending'>) => Promise<boolean>;
    readonly onDelete: (projectId: string) => Promise<void>;
};

function getProjectStatusClassName(status: WorkshopProjectStatus): string {
    switch (status) {
        case 'approved':
            return 'border-emerald-200 bg-emerald-50 text-emerald-800';
        case 'rejected':
            return 'border-rose-200 bg-rose-50 text-rose-800';
        case 'pending':
            return 'border-amber-200 bg-amber-50 text-amber-800';
    }
}

/**
 * The administration queue for the same gallery a community member sees. The status action is deliberately separate
 * from deletion: rejecting retains a trace for the author, while deletion is reserved for content which must go away.
 */
export function WorkshopProjectAdmin({ projects, onChangeStatus, onDelete }: WorkshopProjectAdminProps) {
    const [changingProjectId, setChangingProjectId] = useState<string | null>(null);
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

    const handleChangeStatus = async (projectId: string, status: Exclude<WorkshopProjectStatus, 'pending'>) => {
        setChangingProjectId(projectId);
        try {
            await onChangeStatus(projectId, status);
        } finally {
            setChangingProjectId((currentProjectId) => (currentProjectId === projectId ? null : currentProjectId));
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!window.confirm('Opravdu tento projekt trvale smazat?')) {
            return;
        }

        setDeletingProjectId(projectId);
        try {
            await onDelete(projectId);
        } finally {
            setDeletingProjectId((currentProjectId) => (currentProjectId === projectId ? null : currentProjectId));
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                    <FolderKanban className="h-5 w-5 text-violet-600" /> Projekty komunity
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Nové příspěvky jsou v místnosti viditelné jen autorovi, dokud je neschválíte. Zamítnutý příspěvek
                    zůstane autorovi jako informace, smazání jej odstraní úplně.
                </p>
            </div>

            <div className="mt-6 space-y-3">
                {projects.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Zatím nikdo nesdílel žádný projekt.
                    </p>
                ) : (
                    projects.map((project) => {
                        const isChanging = changingProjectId === project.id;
                        const isDeleting = deletingProjectId === project.id;
                        const isBusy = isChanging || isDeleting;

                        return (
                            <article key={project.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="break-words font-semibold text-slate-950">
                                                {project.title}
                                            </h3>
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getProjectStatusClassName(project.status)}`}
                                            >
                                                {getWorkshopProjectStatusLabel(project.status)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">Sdílí {project.authorName}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {project.status !== 'approved' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={isBusy}
                                                onClick={() => void handleChangeStatus(project.id, 'approved')}
                                            >
                                                <Check className="mr-1.5 h-4 w-4" />
                                                {isChanging ? 'Ukládám…' : 'Schválit'}
                                            </Button>
                                        ) : null}
                                        {project.status !== 'rejected' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={isBusy}
                                                onClick={() => void handleChangeStatus(project.id, 'rejected')}
                                            >
                                                <X className="mr-1.5 h-4 w-4" /> Zamítnout
                                            </Button>
                                        ) : null}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            disabled={isBusy}
                                            onClick={() => void handleDelete(project.id)}
                                            className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" /> {isDeleting ? 'Mažu…' : 'Smazat'}
                                        </Button>
                                    </div>
                                </div>
                                {project.description ? (
                                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                        {project.description}
                                    </p>
                                ) : null}
                                {project.url !== null ? (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{getWorkshopProjectLinkLabel(project.url)}</span>
                                    </a>
                                ) : null}
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}
