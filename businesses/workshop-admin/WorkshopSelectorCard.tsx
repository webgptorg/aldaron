'use client';

import {
    formatWorkshopAdminDateTime,
    formatWorkshopParticipantCount,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays, Users } from 'lucide-react';

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
                <WorkshopPhaseBadge phase={getWorkshopPhase(workshop)} />
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopParticipantCount(workshop.participantCount)}
                </span>
            </span>
        </button>
    );
}
