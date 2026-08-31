'use client';

import { COMMUNITY_MEMBERSHIP_STATUS_LABELS } from '@/businesses/community/membership/communityMembershipStatusPresentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES,
    type CommunityMembershipAdminQuery,
    type CommunityMembershipAdminSortBy,
} from '@/lib/community-membership/communityMembershipAdminQuery';
import { STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES } from '@/lib/community-membership/communityMembershipTypes';
import { SlidersHorizontal, X } from 'lucide-react';

const COMMUNITY_MEMBERSHIP_SORT_LABELS: Readonly<Record<CommunityMembershipAdminSortBy, string>> = {
    updatedAt: 'Poslední změna',
    createdAt: 'Požadováno',
    fullname: 'Jméno',
    email: 'E-mail',
    status: 'Stav',
    monthlyPriceCzk: 'Měsíční cena',
    activatedAt: 'Aktivováno',
    currentPeriodEndsAt: 'Zaplaceno do',
    canceledAt: 'Zrušeno',
};

type CommunityMembershipAdminFiltersProps = {
    readonly query: CommunityMembershipAdminQuery;
    readonly onChange: (changes: Partial<CommunityMembershipAdminQuery>) => void;
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

function isMembershipFilterActive(query: CommunityMembershipAdminQuery): boolean {
    return query.searchQuery !== '' || query.status !== null || query.isTestPayment !== null;
}

/**
 * Controls the server query of payment records. Its query names remain separate from participant filters, because both
 * tables can be opened from one shareable community-administration URL.
 */
export function CommunityMembershipAdminFilters({ query, onChange }: CommunityMembershipAdminFiltersProps) {
    const isFilterActive = isMembershipFilterActive(query);

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
                    Stav členství
                    <select
                        value={query.status ?? ''}
                        onChange={(event) =>
                            onChange({
                                status:
                                    STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES.find(
                                        (status) => status === event.target.value,
                                    ) ?? null,
                            })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        <option value="">Všechny stavy</option>
                        {STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                                {COMMUNITY_MEMBERSHIP_STATUS_LABELS[status]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Stripe prostředí
                    <select
                        value={query.isTestPayment === null ? '' : String(query.isTestPayment)}
                        onChange={(event) => onChange({ isTestPayment: getBooleanFilterValue(event.target.value) })}
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        <option value="">Ostré i testovací</option>
                        <option value="false">Ostré platby</option>
                        <option value="true">Testovací platby</option>
                    </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Řadit podle
                    <select
                        value={query.sortBy}
                        onChange={(event) =>
                            onChange({ sortBy: event.target.value as CommunityMembershipAdminSortBy })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        {COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES.map((sortBy) => (
                            <option key={sortBy} value={sortBy}>
                                {COMMUNITY_MEMBERSHIP_SORT_LABELS[sortBy]}
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
                                sortDirection: event.target.value as CommunityMembershipAdminQuery['sortDirection'],
                            })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
                    >
                        <option value="DESCENDING">Sestupně</option>
                        <option value="ASCENDING">Vzestupně</option>
                    </select>
                </label>
            </div>
            {isFilterActive && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => onChange({ searchQuery: '', status: null, isTestPayment: null })}
                >
                    <X className="mr-1.5 h-4 w-4" /> Vymazat filtry
                </Button>
            )}
        </div>
    );
}
