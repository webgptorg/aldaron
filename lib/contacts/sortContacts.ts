import type { Contact, ContactColumnKey } from './Contact';
import { compareContactSortValues, getContactSortValue } from './contactValues';

/**
 * Direction in which the contacts table is sorted
 */
export type ContactsSortDirection = 'ASCENDING' | 'DESCENDING';

/**
 * Which column the contacts table is sorted by and in which direction
 */
export type ContactsSortState = {
    readonly columnKey: ContactColumnKey;
    readonly direction: ContactsSortDirection;
};

/**
 * The newest contacts first, the same order in which the contacts arrive from the database
 */
export const DEFAULT_CONTACTS_SORT_STATE: ContactsSortState = {
    columnKey: 'createdAt',
    direction: 'DESCENDING',
};

/**
 * Direction which is used when the user picks a column which is not sorted by yet
 *
 * Note: Dates are the most useful the newest first, everything else reads better from A to Z
 */
function getInitialSortDirection(columnKey: ContactColumnKey): ContactsSortDirection {
    return columnKey === 'createdAt' ? 'DESCENDING' : 'ASCENDING';
}

/**
 * Sort state after the user clicks on the header of one column
 */
export function toggleContactsSortState(sortState: ContactsSortState, columnKey: ContactColumnKey): ContactsSortState {
    if (sortState.columnKey !== columnKey) {
        return { columnKey, direction: getInitialSortDirection(columnKey) };
    }

    return { columnKey, direction: sortState.direction === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING' };
}

/**
 * Compare two contacts according to the sort state
 *
 * Note: Contacts with an empty value stay at the end in both directions, because they carry no information
 */
function compareContacts(contactA: Contact, contactB: Contact, sortState: ContactsSortState): number {
    const sortValueA = getContactSortValue(contactA, sortState.columnKey);
    const sortValueB = getContactSortValue(contactB, sortState.columnKey);

    if (sortValueA === null || sortValueB === null) {
        if (sortValueA === sortValueB) {
            return 0;
        }
        return sortValueA === null ? 1 : -1;
    }

    const ascendingOrder = compareContactSortValues(sortValueA, sortValueB);
    return sortState.direction === 'ASCENDING' ? ascendingOrder : -ascendingOrder;
}

/**
 * Sort the contacts by one column
 *
 * @returns New array, the given contacts are never mutated
 */
export function sortContacts(contacts: readonly Contact[], sortState: ContactsSortState): Contact[] {
    return contacts.slice().sort((contactA, contactB) => compareContacts(contactA, contactB, sortState));
}
