import type { Contact, ContactColumnKey } from './Contact';
import { getContactColumnDefinition } from './contactColumnDefinitions';
import { compareContactSortValues, getContactSortValue } from './contactValues';

/**
 * Every direction in which the contacts table can be sorted
 */
export const CONTACTS_SORT_DIRECTIONS = ['ASCENDING', 'DESCENDING'] as const;

/**
 * Direction in which the contacts table is sorted
 */
export type ContactsSortDirection = (typeof CONTACTS_SORT_DIRECTIONS)[number];

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
    return getContactColumnDefinition(columnKey).cellKind === 'DATE' ? 'DESCENDING' : 'ASCENDING';
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
 * One contact together with the value it is sorted by
 *
 * Note: The value is read once per contact and not again in every single comparison, because reading it means parsing
 *       the date the contact carries
 */
type ContactWithSortValue = {
    readonly contact: Contact;
    readonly sortValue: string | number | null;
};

/**
 * Compare two contacts by the values they are sorted by
 *
 * Note: Contacts with an empty value stay at the end in both directions, because they carry no information
 */
function compareContactsWithSortValue(
    contactA: ContactWithSortValue,
    contactB: ContactWithSortValue,
    direction: ContactsSortDirection,
): number {
    const { sortValue: sortValueA } = contactA;
    const { sortValue: sortValueB } = contactB;

    if (sortValueA === null || sortValueB === null) {
        if (sortValueA === sortValueB) {
            return 0;
        }
        return sortValueA === null ? 1 : -1;
    }

    const ascendingOrder = compareContactSortValues(sortValueA, sortValueB);
    return direction === 'ASCENDING' ? ascendingOrder : -ascendingOrder;
}

/**
 * Sort the contacts by one column
 *
 * @returns New array, the given contacts are never mutated
 */
export function sortContacts(contacts: readonly Contact[], sortState: ContactsSortState): Contact[] {
    const contactsWithSortValue = contacts.map((contact): ContactWithSortValue => {
        return { contact, sortValue: getContactSortValue(contact, sortState.columnKey) };
    });

    contactsWithSortValue.sort((contactA, contactB) =>
        compareContactsWithSortValue(contactA, contactB, sortState.direction),
    );

    return contactsWithSortValue.map(({ contact }) => contact);
}
