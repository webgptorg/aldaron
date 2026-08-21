'use client';

import { AdminContactDetails } from '@/components/admin/AdminContactDetails';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSynchronizedHorizontalScroll } from '@/hooks/useSynchronizedHorizontalScroll';
import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import type { Contact, ContactChanges, ContactColumnKey } from '@/lib/contacts/Contact';
import {
    CONTACT_ACTIONS_COLUMN_WIDTH,
    CONTACT_COLUMN_DEFINITIONS,
    CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH,
} from '@/lib/contacts/contactColumnDefinitions';
import type { ContactsSortState } from '@/lib/contacts/sortContacts';
import type { ColumnWidths } from '@/hooks/useResizableColumnWidths';
import type { PointerEvent } from 'react';
import { ContactActions } from './ContactActions';
import { ContactsTableCell } from './ContactsTableCell';
import { ContactsTableHeaderCell } from './ContactsTableHeaderCell';

type ContactsTableProps = {
    readonly contacts: readonly AdminJoinedContact[];
    readonly columnWidths: ColumnWidths;
    readonly sortState: ContactsSortState;
    readonly onToggleSort: (columnKey: ContactColumnKey) => void;
    readonly onStartColumnResize: (columnKey: string, pointerEvent: PointerEvent) => void;
    readonly onChangeContact: (contactId: number, contactChanges: ContactChanges) => void;
    readonly onEditContact: (contact: Contact) => void;
    readonly onDeleteContact: (contactId: number) => Promise<boolean>;
};

/**
 * Table of the contacts with resizable and sortable columns
 *
 * Note: The layout is fixed and driven by `columnWidths`, so a narrower column really does cut its text sooner
 */
export function ContactsTable(props: ContactsTableProps) {
    const {
        contacts,
        columnWidths,
        sortState,
        onToggleSort,
        onStartColumnResize,
        onChangeContact,
        onEditContact,
        onDeleteContact,
    } = props;

    const tableWidth = CONTACT_COLUMN_DEFINITIONS.reduce(
        (totalWidth, column) => totalWidth + (columnWidths[column.key] ?? column.defaultWidth),
        CONTACT_ACTIONS_COLUMN_WIDTH + CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH,
    );

    const { topScrollContainerRef, bottomScrollContainerRef, handleTopScroll, handleBottomScroll } =
        useSynchronizedHorizontalScroll();

    if (contacts.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">No contact matches the filter</div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="rounded-lg border">
                <div
                    ref={topScrollContainerRef}
                    className="h-5 overflow-x-auto overflow-y-hidden border-b"
                    onScroll={handleTopScroll}
                    role="region"
                    aria-label="Scroll contacts table horizontally"
                    tabIndex={0}
                >
                    <div aria-hidden="true" className="h-px" style={{ width: tableWidth }} />
                </div>
                <Table
                    containerRef={bottomScrollContainerRef}
                    containerClassName="rounded-b-lg"
                    className="table-fixed"
                    style={{ width: tableWidth }}
                    onContainerScroll={handleBottomScroll}
                >
                    <colgroup>
                        {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                            <col key={column.key} style={{ width: columnWidths[column.key] ?? column.defaultWidth }} />
                        ))}
                        <col style={{ width: CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH }} />
                        <col style={{ width: CONTACT_ACTIONS_COLUMN_WIDTH }} />
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
                            <TableHead className="px-4">Spojené údaje a účasti</TableHead>
                            <TableHead className="px-4">Actions</TableHead>
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
                                <TableCell className="p-2 align-top">
                                    <AdminContactDetails
                                        contactGroup={contact.contactGroup}
                                        isContactRecordsIncluded={contact.contactGroup.contacts.length > 1}
                                        isWorkshopParticipationsIncluded
                                    />
                                </TableCell>
                                <TableCell className="p-2 align-top">
                                    <ContactActions
                                        contact={contact}
                                        onEditContact={onEditContact}
                                        onDeleteContact={onDeleteContact}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
