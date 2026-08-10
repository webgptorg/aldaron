'use client';

import type { ContactColumnKey } from '@/lib/contacts/Contact';
import type { ContactColumnDefinition } from '@/lib/contacts/contactColumnDefinitions';
import type { ContactsSortState } from '@/lib/contacts/sortContacts';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { PointerEvent } from 'react';

type ContactsTableHeaderCellProps = {
    readonly column: ContactColumnDefinition;
    readonly sortState: ContactsSortState;
    readonly onToggleSort: (columnKey: ContactColumnKey) => void;
    readonly onStartResize: (columnKey: string, pointerEvent: PointerEvent) => void;
};

/**
 * Header of one column which sorts the table when it is clicked and resizes the column when its right edge is dragged
 */
export function ContactsTableHeaderCell(props: ContactsTableHeaderCellProps) {
    const { column, sortState, onToggleSort, onStartResize } = props;

    const isSortedByThisColumn = sortState.columnKey === column.key;
    const SortIcon = !isSortedByThisColumn ? ChevronsUpDown : sortState.direction === 'ASCENDING' ? ArrowUp : ArrowDown;

    return (
        <div className="relative flex h-full items-center pr-2">
            <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-1 text-left font-medium hover:text-foreground"
                onClick={() => onToggleSort(column.key)}
                title={`Sort by ${column.label}`}
            >
                <span className="truncate">{column.label}</span>
                <SortIcon className={`h-3 w-3 shrink-0 ${isSortedByThisColumn ? 'opacity-100' : 'opacity-30'}`} />
            </button>
            {/* Note: The handle reaches into the padding of the cell, so that it sits right on the edge of the column */}
            <div
                className="group absolute -right-4 top-0 h-full w-4 cursor-col-resize touch-none select-none"
                onPointerDown={(pointerEvent) => {
                    pointerEvent.preventDefault();
                    onStartResize(column.key, pointerEvent);
                }}
                title={`Drag to resize the ${column.label} column`}
            >
                <div className="ml-auto h-full w-px bg-border transition-colors group-hover:w-0.5 group-hover:bg-primary" />
            </div>
        </div>
    );
}
