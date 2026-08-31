'use client';

import { Button } from '@/components/ui/button';

const WORKSHOP_PARTICIPANT_PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;

type WorkshopParticipantPaginationProps = {
    readonly totalCount: number;
    readonly page: number;
    readonly pageSize: number;
    /**
     * The reusable controls name their listed records rather than assuming every paged table contains participants.
     */
    readonly itemLabel?: string;
    readonly emptyMessage?: string;
    readonly onChangePage: (page: number) => void;
    readonly onChangePageSize: (pageSize: number) => void;
};

/**
 * Keeps pagination presentation separate from the query and network work of a paged admin list.
 */
export function WorkshopParticipantPagination({
    totalCount,
    page,
    pageSize,
    itemLabel = 'účastníků',
    emptyMessage = 'Žádný účastník neodpovídá filtru.',
    onChangePage,
    onChangePageSize,
}: WorkshopParticipantPaginationProps) {
    const totalPageCount = Math.max(1, Math.ceil(totalCount / pageSize));
    const isEmpty = totalCount === 0;
    const isOnFirstPage = page <= 1;
    const isOnLastPage = page >= totalPageCount;
    const firstParticipantNumber = isEmpty ? 0 : (page - 1) * pageSize + 1;
    const lastParticipantNumber = Math.min(page * pageSize, totalCount);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <label className="flex items-center gap-2">
                    Na stránku
                    <select
                        value={pageSize}
                        onChange={(event) => onChangePageSize(Number(event.target.value))}
                        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800"
                    >
                        {WORKSHOP_PARTICIPANT_PAGE_SIZE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
                <span>
                    {isEmpty
                        ? emptyMessage
                        : `Zobrazeno ${firstParticipantNumber}–${lastParticipantNumber} z ${totalCount} ${itemLabel}`}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isOnFirstPage || isEmpty}
                    onClick={() => onChangePage(page - 1)}
                >
                    ← Předchozí
                </Button>
                <span className="text-sm text-slate-500">
                    Strana {Math.min(page, totalPageCount)} z {totalPageCount}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isOnLastPage || isEmpty}
                    onClick={() => onChangePage(page + 1)}
                >
                    Další →
                </Button>
            </div>
        </div>
    );
}
