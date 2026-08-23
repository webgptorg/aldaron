'use client';

import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import type { ContactColumnKey } from '@/lib/contacts/Contact';
import {
    parseContactsViewState,
    serializeContactsViewState,
    type ContactsViewState,
} from '@/lib/contacts/contactsViewState';
import type { ContactsFilter } from '@/lib/contacts/filterContacts';
import { FIRST_CONTACTS_PAGE, type ContactsPerPage } from '@/lib/contacts/paginateContacts';
import { toggleContactsSortState } from '@/lib/contacts/sortContacts';
import { useCallback } from 'react';

type UseContactsViewStateResult = ContactsViewState & {
    readonly changeFilter: (filter: ContactsFilter) => void;
    readonly toggleSort: (columnKey: ContactColumnKey) => void;
    readonly changeContactsPerPage: (contactsPerPage: ContactsPerPage) => void;
    readonly changePage: (currentPage: number) => void;
};

/**
 * The filtering, the sorting and the pagination of the contacts table, kept in the URL so that the link to exactly the
 * same view can be shared
 */
export function useContactsViewState(): UseContactsViewStateResult {
    const [viewState, setViewState] = useUrlSynchronizedViewState<ContactsViewState>({
        parseViewState: parseContactsViewState,
        serializeViewState: serializeContactsViewState,
    });

    // Note: Every change of which contacts are shown starts over at the first page, because the page the user is on
    //       does not have to exist in the new view at all
    const changeShownContacts = useCallback(
        (getViewStateChanges: (previousViewState: ContactsViewState) => Partial<ContactsViewState>) =>
            setViewState((previousViewState) => ({
                ...previousViewState,
                ...getViewStateChanges(previousViewState),
                currentPage: FIRST_CONTACTS_PAGE,
            })),
        [],
    );

    const changeFilter = useCallback(
        (filter: ContactsFilter) => changeShownContacts(() => ({ filter })),
        [changeShownContacts],
    );

    const toggleSort = useCallback(
        (columnKey: ContactColumnKey) =>
            changeShownContacts((previousViewState) => ({
                sortState: toggleContactsSortState(previousViewState.sortState, columnKey),
            })),
        [changeShownContacts],
    );

    const changeContactsPerPage = useCallback(
        (contactsPerPage: ContactsPerPage) => changeShownContacts(() => ({ contactsPerPage })),
        [changeShownContacts],
    );

    // Note: The page which is already shown is never set again, so that keeping a shared page number valid never loops
    const changePage = useCallback(
        (currentPage: number) =>
            setViewState((previousViewState) =>
                previousViewState.currentPage === currentPage
                    ? previousViewState
                    : { ...previousViewState, currentPage },
            ),
        [],
    );

    return { ...viewState, changeFilter, toggleSort, changeContactsPerPage, changePage };
}
