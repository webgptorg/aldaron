'use client';

import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
import { Input } from '@/components/ui/input';
import { sortWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { RefreshCw, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

type WorkshopSelectorCardListProps = {
    readonly label: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly isLoading: boolean;
    readonly emptyMessage: string;
    readonly onSelect: (workshopId: string) => void;
};

const CZECH_LOCALE = 'cs-CZ';

function normalizeWorkshopSearchQuery(searchQuery: string): string {
    return searchQuery
        .trim()
        .toLocaleLowerCase(CZECH_LOCALE)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isWorkshopMatchingSearchQuery(workshop: WorkshopAdminSummary, normalizedSearchQuery: string): boolean {
    if (normalizedSearchQuery.length === 0) {
        return true;
    }

    return normalizeWorkshopSearchQuery(`${workshop.title} ${workshop.slug}`).includes(normalizedSearchQuery);
}

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
    const searchInputId = useId();
    const [searchQuery, setSearchQuery] = useState('');
    const sortedWorkshops = useMemo(() => sortWorkshopsByPhase(workshops), [workshops]);
    const matchingWorkshops = useMemo(() => {
        const normalizedSearchQuery = normalizeWorkshopSearchQuery(searchQuery);
        return sortedWorkshops.filter((workshop) => isWorkshopMatchingSearchQuery(workshop, normalizedSearchQuery));
    }, [searchQuery, sortedWorkshops]);

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
                <>
                    <label htmlFor={searchInputId} className="sr-only">
                        Hledat workshop
                    </label>
                    <div className="relative mt-3">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <Input
                            id={searchInputId}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Hledat workshop"
                            className="h-9 pl-9"
                        />
                    </div>
                    {matchingWorkshops.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                            Žádný workshop neodpovídá hledání.
                        </p>
                    ) : (
                        <ul
                            aria-label="Seznam workshopů"
                            className="mt-3 space-y-1.5 lg:max-h-[min(34rem,calc(100dvh-31rem))] lg:overflow-y-auto lg:pr-1"
                        >
                            {matchingWorkshops.map((workshop) => (
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
                </>
            )}
        </section>
    );
}
