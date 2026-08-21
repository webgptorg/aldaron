'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES,
    type WorkshopAdminParticipantQuery,
    type WorkshopAdminParticipantSortBy,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import { SlidersHorizontal, X } from 'lucide-react';

const WORKSHOP_PARTICIPANT_SORT_LABELS: Readonly<Record<WorkshopAdminParticipantSortBy, string>> = {
    fullname: 'Jméno',
    email: 'E-mail',
    connectedAt: 'Registrace',
    lastSeenAt: 'Naposledy aktivní',
    activeDurationSeconds: 'Aktivní čas',
    commentCount: 'Komentáře',
    reactionCount: 'Reakce',
    linkClickCount: 'Kliknutí na materiály',
    upvoteCount: 'Hlasy',
};

type WorkshopParticipantFiltersProps = {
    readonly query: WorkshopAdminParticipantQuery;
    readonly onChange: (changes: Partial<WorkshopAdminParticipantQuery>) => void;
};

function getBooleanFilterValue(value: string): boolean | null {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return null;
}

function getDateInputValue(timestamp: string | null): string {
    return timestamp === null ? '' : timestamp.slice(0, 10);
}

function getDateBoundaryTimestamp(dateValue: string, isEndOfDay: boolean): string | null {
    if (dateValue === '') {
        return null;
    }

    const timestamp = new Date(`${dateValue}T${isEndOfDay ? '23:59:59.999' : '00:00:00.000'}`);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function isParticipantFilterActive(query: WorkshopAdminParticipantQuery): boolean {
    return (
        query.searchQuery !== '' ||
        query.isTrusted !== null ||
        query.isInteractionBanned !== null ||
        query.registeredFrom !== null ||
        query.registeredTo !== null
    );
}

/**
 * Controls which audience is requested from the paged participant endpoint.
 */
export function WorkshopParticipantFilters({ query, onChange }: WorkshopParticipantFiltersProps) {
    const isFilterActive = isParticipantFilterActive(query);

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <SlidersHorizontal className="h-4 w-4 text-cyan-600" /> Filtrování a řazení
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-xs font-medium text-slate-600 sm:col-span-2">
                    Hledat jméno nebo e-mail
                    <Input
                        type="search"
                        value={query.searchQuery}
                        onChange={(event) => onChange({ searchQuery: event.target.value })}
                        className="mt-1 bg-white"
                        placeholder="Například Jana Nováková"
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Registrace od
                    <Input
                        type="date"
                        value={getDateInputValue(query.registeredFrom)}
                        max={getDateInputValue(query.registeredTo) || undefined}
                        onChange={(event) =>
                            onChange({ registeredFrom: getDateBoundaryTimestamp(event.target.value, false) })
                        }
                        className="mt-1 bg-white"
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Registrace do
                    <Input
                        type="date"
                        value={getDateInputValue(query.registeredTo)}
                        min={getDateInputValue(query.registeredFrom) || undefined}
                        onChange={(event) =>
                            onChange({ registeredTo: getDateBoundaryTimestamp(event.target.value, true) })
                        }
                        className="mt-1 bg-white"
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Důvěryhodnost
                    <select
                        value={query.isTrusted === null ? '' : String(query.isTrusted)}
                        onChange={(event) => onChange({ isTrusted: getBooleanFilterValue(event.target.value) })}
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        <option value="">Všichni</option>
                        <option value="true">Důvěryhodní</option>
                        <option value="false">Bez důvěry</option>
                    </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Interakce
                    <select
                        value={query.isInteractionBanned === null ? '' : String(query.isInteractionBanned)}
                        onChange={(event) =>
                            onChange({ isInteractionBanned: getBooleanFilterValue(event.target.value) })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        <option value="">Všichni</option>
                        <option value="false">Povolené</option>
                        <option value="true">Zakázané</option>
                    </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Řadit podle
                    <select
                        value={query.sortBy}
                        onChange={(event) =>
                            onChange({ sortBy: event.target.value as WorkshopAdminParticipantSortBy })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        {WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES.map((sortBy) => (
                            <option key={sortBy} value={sortBy}>
                                {WORKSHOP_PARTICIPANT_SORT_LABELS[sortBy]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Směr řazení
                    <select
                        value={query.sortDirection}
                        onChange={(event) =>
                            onChange({
                                sortDirection: event.target.value as WorkshopAdminParticipantQuery['sortDirection'],
                            })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        <option value="ASCENDING">Vzestupně</option>
                        <option value="DESCENDING">Sestupně</option>
                    </select>
                </label>
            </div>
            {isFilterActive && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                        onChange({
                            searchQuery: '',
                            isTrusted: null,
                            isInteractionBanned: null,
                            registeredFrom: null,
                            registeredTo: null,
                        })
                    }
                >
                    <X className="mr-1.5 h-4 w-4" /> Vymazat filtry
                </Button>
            )}
        </div>
    );
}
