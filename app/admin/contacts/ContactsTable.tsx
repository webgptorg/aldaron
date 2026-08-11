'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Contact, ContactChanges, ContactColumnKey } from '@/lib/contacts/Contact';
import { CONTACT_COLUMN_DEFINITIONS } from '@/lib/contacts/contactColumnDefinitions';
import type { ContactsSortState } from '@/lib/contacts/sortContacts';
import type { ColumnWidths } from '@/hooks/useResizableColumnWidths';
import type { PointerEvent } from 'react';
import { ContactsTableCell } from './ContactsTableCell';
import { ContactsTableHeaderCell } from './ContactsTableHeaderCell';

type ContactsTableProps = {
    readonly contacts: readonly Contact[];
    readonly columnWidths: ColumnWidths;
    readonly sortState: ContactsSortState;
    readonly onToggleSort: (columnKey: ContactColumnKey) => void;
    readonly onStartColumnResize: (columnKey: string, pointerEvent: PointerEvent) => void;
    readonly onChangeContact: (contactId: number, contactChanges: ContactChanges) => void;
};

/**
 * Table of the contacts with resizable and sortable columns
 *
 * Note: The layout is fixed and driven by `columnWidths`, so a narrower column really does cut its text sooner
 */
export function ContactsTable(props: ContactsTableProps) {
    const { contacts, columnWidths, sortState, onToggleSort, onStartColumnResize, onChangeContact } = props;

    const tableWidth = CONTACT_COLUMN_DEFINITIONS.reduce(
        (totalWidth, column) => totalWidth + (columnWidths[column.key] ?? column.defaultWidth),
        0,
    );

    if (contacts.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">No contact matches the filter</div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Table containerClassName="rounded-lg border" className="table-fixed" style={{ width: tableWidth }}>
                <colgroup>
                    {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                        <col key={column.key} style={{ width: columnWidths[column.key] ?? column.defaultWidth }} />
                    ))}
                </colgroup>
                <TableHeader>
                    <TableRow>
                        {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                            <TableHead key={column.key} className="overflow-hidden px-4">
                                <ContactsTableHeaderCell
                                    column={column}
                                    sortState={sortState}
                                    onToggleSort={onToggleSort}
                                    onStartResize={onStartColumnResize}
                                />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                            {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                                <TableCell key={column.key} className="overflow-hidden p-2 align-top">
                                    <ContactsTableCell
                                        contact={contact}
                                        column={column}
                                        onChangeContact={onChangeContact}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TooltipProvider>
    );
}
