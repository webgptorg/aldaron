'use client';

import {
    formatWorkshopAdminDateTime,
    formatWorkshopParticipantCount,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import { getWorkshopPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays, Users } from 'lucide-react';

/**
 * How every phase names itself and how strongly it asks for attention: a running room is the one an administrator
 * has to reach immediately, a prepared term still matters, and the history stays quiet.
 */
const WORKSHOP_PHASE_DEFINITIONS: Readonly<
    Record<WorkshopPhase, { readonly label: string; readonly className: string }>
> = {
    ongoing: { label: 'Probíhá', className: 'bg-emerald-100 text-emerald-800' },
    upcoming: { label: 'Nadchází', className: 'bg-cyan-100 text-cyan-800' },
    past: { label: 'Proběhl', className: 'bg-slate-100 text-slate-500' },
};

type WorkshopSelectorCardProps = {
    readonly workshop: WorkshopAdminSummary;
    readonly isSelected: boolean;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * One selectable occurrence, which says at a glance when it happens, whether it is running, and how large its
 * audience is.
 */
export function WorkshopSelectorCard({ workshop, isSelected, onSelect }: WorkshopSelectorCardProps) {
    const phaseDefinition = WORKSHOP_PHASE_DEFINITIONS[getWorkshopPhase(workshop)];

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(workshop.id)}
            className={`w-full rounded-xl border p-3 text-left transition-colors ${isSelected ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500' : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50'}`}
        >
            <span className="block break-words text-sm font-semibold text-slate-950">{workshop.title}</span>
            <span className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {formatWorkshopAdminDateTime(workshop.startsAt)}
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${phaseDefinition.className}`}>
                    {phaseDefinition.label}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopParticipantCount(workshop.participantCount)}
                </span>
            </span>
        </button>
    );
}
