'use client';

import {
    formatWorkshopAdminDateTime,
    formatWorkshopParticipantCount,
    formatWorkshopRegisteredParticipantCount,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import {
    PARTICIPANT_COUNT_TITLE,
    REGISTERED_PARTICIPANT_COUNT_TITLE,
} from '@/businesses/workshop-admin/workshopAudienceLabels';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays, UserPlus, Users } from 'lucide-react';

type WorkshopSelectorCardProps = {
    readonly workshop: WorkshopAdminSummary;
    readonly isSelected: boolean;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * One selectable occurrence, which says at a glance when it happens, whether it is running, how many people signed up
 * for it, and how many of them really came.
 */
export function WorkshopSelectorCard({ workshop, isSelected, onSelect }: WorkshopSelectorCardProps) {
    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(workshop.id)}
            className={`w-full rounded-xl border p-2.5 text-left transition-colors ${isSelected ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500' : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50'}`}
        >
            <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950" title={workshop.title}>
                    {workshop.title}
                </span>
                <WorkshopPhaseBadge phase={getWorkshopPhase(workshop)} className="!px-2 !py-0.5 !text-[11px]" />
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopAdminDateTime(workshop.startsAt)}
                </span>
                {workshop.registeredParticipantCount !== null && (
                    <span className="flex items-center gap-1.5" title={REGISTERED_PARTICIPANT_COUNT_TITLE}>
                        <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatWorkshopRegisteredParticipantCount(workshop.registeredParticipantCount)}
                    </span>
                )}
                <span className="flex items-center gap-1.5" title={PARTICIPANT_COUNT_TITLE}>
                    <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopParticipantCount(workshop.participantCount)}
                </span>
            </span>
        </button>
    );
}
