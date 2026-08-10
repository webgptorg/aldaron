'use client';

import { Button } from '@/components/ui/button';
import { useGetParam } from '@/hooks/useGetParam';
import { useResizableColumnWidths } from '@/hooks/useResizableColumnWidths';
import type { ContactColumnKey, ContactDraft } from '@/lib/contacts/Contact';
import {
    DEFAULT_CONTACT_COLUMN_WIDTHS,
    MAXIMAL_CONTACT_COLUMN_WIDTH,
    MINIMAL_CONTACT_COLUMN_WIDTH,
} from '@/lib/contacts/contactColumnDefinitions';
import { DEFAULT_CONTACTS_FILTER, filterContacts, type ContactsFilter } from '@/lib/contacts/filterContacts';
import { DEFAULT_CONTACTS_SORT_STATE, sortContacts, toggleContactsSortState } from '@/lib/contacts/sortContacts';
import { useCallback, useMemo, useState } from 'react';
import { AddContactForm } from './AddContactForm';
import { ContactsExportBar } from './ContactsExportBar';
import { ContactsFilterBar } from './ContactsFilterBar';
import { ContactsTable } from './ContactsTable';
import { useContacts } from './useContacts';

/**
 * Key under which the widths of the columns survive a reload of the page
 */
const CONTACT_COLUMN_WIDTHS_STORAGE_KEY = 'admin-contacts-column-widths';

/**
 * Dashboard which shows, filters, sorts and exports the gathered contacts and leads
 */
export default function AdminContactsComponent() {
    const [adminToken] = useGetParam('token');
    const { contacts, isLoading, errorMessage, changeContact, addContact } = useContacts(adminToken);

    const [filter, setFilter] = useState<ContactsFilter>(DEFAULT_CONTACTS_FILTER);
    const [sortState, setSortState] = useState(DEFAULT_CONTACTS_SORT_STATE);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const { widths, startResizing, resetWidths } = useResizableColumnWidths({
        defaultWidths: DEFAULT_CONTACT_COLUMN_WIDTHS,
        minimalWidth: MINIMAL_CONTACT_COLUMN_WIDTH,
        maximalWidth: MAXIMAL_CONTACT_COLUMN_WIDTH,
        storageKey: CONTACT_COLUMN_WIDTHS_STORAGE_KEY,
    });

    // Note: This is the current view, exactly what is shown in the table and exactly what gets exported
    const visibleContacts = useMemo(
        () => sortContacts(filterContacts(contacts, filter), sortState),
        [contacts, filter, sortState],
    );

    const toggleSort = useCallback(
        (columnKey: ContactColumnKey) =>
            setSortState((previousSortState) => toggleContactsSortState(previousSortState, columnKey)),
        [],
    );

    const handleAddContact = useCallback(
        async (contactDraft: ContactDraft) => {
            const isAdded = await addContact(contactDraft);
            if (isAdded) {
                setIsAddFormOpen(false);
            }
            return isAdded;
        },
        [addContact],
    );

    return (
        <div className="p-8">
            <h1 className="mb-4 text-2xl font-bold">Contacts & Leads Dashboard</h1>

            {errorMessage !== null && (
                <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            <ContactsFilterBar filter={filter} onChangeFilter={setFilter} />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <ContactsExportBar exportedContacts={visibleContacts} totalContactsCount={contacts.length} />
                <div className="grow" />
                <Button variant="ghost" onClick={resetWidths} title="Set the widths of all the columns back to default">
                    Reset column widths
                </Button>
                <Button onClick={() => setIsAddFormOpen(!isAddFormOpen)} variant={isAddFormOpen ? 'outline' : 'default'}>
                    {isAddFormOpen ? 'Cancel' : 'Add Contact'}
                </Button>
            </div>

            {isAddFormOpen && <AddContactForm onAddContact={handleAddContact} />}

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <ContactsTable
                    contacts={visibleContacts}
                    columnWidths={widths}
                    sortState={sortState}
                    onToggleSort={toggleSort}
                    onStartColumnResize={startResizing}
                    onChangeContact={changeContact}
                />
            )}
        </div>
    );
}
