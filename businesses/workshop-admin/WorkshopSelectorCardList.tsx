'use client';

import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
import { sortWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

type WorkshopSelectorCardListProps = {
    readonly label: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly isLoading: boolean;
    readonly emptyMessage: string;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * Offers every occurrence as a card, ordered so that a running room leads the list, the prepared terms follow it, and
 * the history closes it.
 */
export function WorkshopSelectorCardList({
    label,
    workshops,
    selectedWorkshopId,
    isLoading,
    emptyMessage,
    onSelect,
}: WorkshopSelectorCardListProps) {
    const sortedWorkshops = useMemo(() => sortWorkshopsByPhase(workshops), [workshops]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" aria-label="Načítání" />
                </div>
            ) : sortedWorkshops.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    {emptyMessage}
                </p>
            ) : (
                <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                    {sortedWorkshops.map((workshop) => (
                        <li key={workshop.id}>
                            <WorkshopSelectorCard
                                workshop={workshop}
                                isSelected={workshop.id === selectedWorkshopId}
                                onSelect={onSelect}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
