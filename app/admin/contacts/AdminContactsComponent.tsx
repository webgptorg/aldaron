'use client';

import { Button } from '@/components/ui/button';
import { useGetParam } from '@/hooks/useGetParam';
import { useResizableColumnWidths } from '@/hooks/useResizableColumnWidths';
import type { ContactDraft } from '@/lib/contacts/Contact';
import {
    DEFAULT_CONTACT_COLUMN_WIDTHS,
    MAXIMAL_CONTACT_COLUMN_WIDTH,
    MINIMAL_CONTACT_COLUMN_WIDTH,
} from '@/lib/contacts/contactColumnDefinitions';
import { filterContacts } from '@/lib/contacts/filterContacts';
import { paginateContacts } from '@/lib/contacts/paginateContacts';
import { sortContacts } from '@/lib/contacts/sortContacts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AddContactForm } from './AddContactForm';
import { ContactsExportBar } from './ContactsExportBar';
import { ContactsFilterBar } from './ContactsFilterBar';
import { ContactsPagination } from './ContactsPagination';
import { ContactsTable } from './ContactsTable';
import { useContacts } from './useContacts';
import { useContactsViewState } from './useContactsViewState';

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

    const {
        filter,
        sortState,
        contactsPerPage,
        currentPage,
        changeFilter,
        toggleSort,
        changeContactsPerPage,
        changePage,
    } = useContactsViewState();

    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const { widths, startResizing, resetWidths } = useResizableColumnWidths({
        defaultWidths: DEFAULT_CONTACT_COLUMN_WIDTHS,
        minimalWidth: MINIMAL_CONTACT_COLUMN_WIDTH,
        maximalWidth: MAXIMAL_CONTACT_COLUMN_WIDTH,
        storageKey: CONTACT_COLUMN_WIDTHS_STORAGE_KEY,
    });

    // Note: This is the current view, the table pages through it and the export downloads all of it
    const filteredAndSortedContacts = useMemo(
        () => sortContacts(filterContacts(contacts, filter), sortState),
        [contacts, filter, sortState],
    );

    const contactsPage = useMemo(
        () => paginateContacts(filteredAndSortedContacts, currentPage, contactsPerPage),
        [contactsPerPage, currentPage, filteredAndSortedContacts],
    );

    // An inline edit can make the final contact on a page stop matching the active filter and a shared link can point
    // to a page which the filter does not reach anymore
    //
    // Note: The page is only kept valid once the contacts are loaded, otherwise a shared page number would be thrown
    //       away while the empty table waits for them
    useEffect(() => {
        if (isLoading) {
            return;
        }

        changePage(contactsPage.currentPage);
    }, [changePage, contactsPage.currentPage, isLoading]);

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

            <ContactsFilterBar filter={filter} onChangeFilter={changeFilter} />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <ContactsExportBar exportedContacts={filteredAndSortedContacts} totalContactsCount={contacts.length} />
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
                <>
                    <ContactsTable
                        contacts={contactsPage.pageContacts}
                        columnWidths={widths}
                        sortState={sortState}
                        onToggleSort={toggleSort}
                        onStartColumnResize={startResizing}
                        onChangeContact={changeContact}
                    />
                    <ContactsPagination
                        contactsPage={contactsPage}
                        contactsPerPage={contactsPerPage}
                        onChangePage={changePage}
                        onChangeContactsPerPage={changeContactsPerPage}
                    />
                </>
            )}
        </div>
    );
}
