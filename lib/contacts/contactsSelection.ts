import type { Contact } from './Contact';
import type { ContactsViewState } from './contactsViewState';
import { filterContacts } from './filterContacts';
import { sortContacts } from './sortContacts';

/**
 * Which contacts belong into the current view and in which order they are read
 *
 * Note: Splitting the table into pages is deliberately not a part of it, the pages only decide how much of the
 *       selection is shown at once while an export always contains all of it
 */
export type ContactsSelection = Pick<ContactsViewState, 'filter' | 'sortState'>;

/**
 * Keep only the selected contacts, in the selected order
 *
 * Note: This is the one and only place which turns a filter and a sorting into contacts, so that the table in the
 *       browser and an export built by the server can never disagree about what the very same view contains
 *
 * @returns New array, the given contacts are never mutated
 */
export function selectContacts<ContactType extends Contact>(
    contacts: readonly ContactType[],
    selection: ContactsSelection,
): ContactType[] {
    return sortContacts(filterContacts(contacts, selection.filter), selection.sortState);
}
