'use client';

import type { ContactColumnKey } from '@/lib/contacts/Contact';
import {
    parseContactsViewState,
    serializeContactsViewState,
    type ContactsViewState,
} from '@/lib/contacts/contactsViewState';
import type { ContactsFilter } from '@/lib/contacts/filterContacts';
import { FIRST_CONTACTS_PAGE, type ContactsPerPage } from '@/lib/contacts/paginateContacts';
import { toggleContactsSortState } from '@/lib/contacts/sortContacts';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * How long the changes of the view are collected before the address bar is written, so that typing into the fulltext
 * search does not rewrite the link letter by letter
 */
const CONTACTS_VIEW_URL_DEBOUNCE_MILLISECONDS = 300;

type UseContactsViewStateResult = ContactsViewState & {
    readonly changeFilter: (filter: ContactsFilter) => void;
    readonly toggleSort: (columnKey: ContactColumnKey) => void;
    readonly changeContactsPerPage: (contactsPerPage: ContactsPerPage) => void;
    readonly changePage: (currentPage: number) => void;
};

/**
 * Build the address of the page which is open, with the given query parameters
 */
function buildUrlWithSearchParams(searchParams: URLSearchParams): string {
    const search = searchParams.toString();

    return `${window.location.pathname}${search === '' ? '' : `?${search}`}${window.location.hash}`;
}

/**
 * The filtering, the sorting and the pagination of the contacts table, kept in the URL so that the link to exactly the
 * same view can be shared
 *
 * Note: The link is read when the dashboard opens and written on every change, never the other way around, so that
 *       typing into the filter stays as smooth as with a plain state
 */
export function useContactsViewState(): UseContactsViewStateResult {
    const searchParams = useSearchParams();

    const [viewState, setViewState] = useState<ContactsViewState>(() =>
        parseContactsViewState(new URLSearchParams(searchParams.toString())),
    );

    useEffect(() => {
        const urlUpdateTimeout = setTimeout(() => {
            const currentSearchParams = new URLSearchParams(window.location.search);
            const newSearchParams = serializeContactsViewState(viewState, currentSearchParams);

            if (newSearchParams.toString() === currentSearchParams.toString()) {
                return;
            }

            // Note: The entry in the history is replaced and not pushed, so that the back button leaves the dashboard
            //       instead of walking back through every single change of the filter
            window.history.replaceState(null, '', buildUrlWithSearchParams(newSearchParams));
        }, CONTACTS_VIEW_URL_DEBOUNCE_MILLISECONDS);

        return () => clearTimeout(urlUpdateTimeout);
    }, [viewState]);

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
