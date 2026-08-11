import type { Contact } from './Contact';

/**
 * The number of contacts which can be displayed in one table page
 */
export const CONTACTS_PER_PAGE_OPTIONS = [50, 100, 200, 500, 'ALL'] as const;

export type ContactsPerPage = (typeof CONTACTS_PER_PAGE_OPTIONS)[number];

/**
 * The table stays practical to browse while still showing a useful amount of context
 */
export const DEFAULT_CONTACTS_PER_PAGE: ContactsPerPage = 100;

/**
 * Number of the very first page of the table, the pages are counted the way the user reads them
 */
export const FIRST_CONTACTS_PAGE = 1;

/**
 * Find the page size which the given text stands for, no matter the letter case
 *
 * Note: The text comes either from the select of the pagination or from a hand written link
 *
 * @returns `null` when the text is none of `CONTACTS_PER_PAGE_OPTIONS`
 */
export function parseContactsPerPage(contactsPerPageValue: string): ContactsPerPage | null {
    const normalizedValue = contactsPerPageValue.trim().toLowerCase();

    return CONTACTS_PER_PAGE_OPTIONS.find((option) => option.toString().toLowerCase() === normalizedValue) ?? null;
}

/**
 * One valid slice of the filtered and sorted contacts table, together with the information needed to render its controls
 */
export type ContactsPage = {
    readonly pageContacts: readonly Contact[];
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalContactsCount: number;
    readonly firstContactNumber: number;
    readonly lastContactNumber: number;
};

/**
 * Calculate how many pages are needed, keeping an empty result on one valid page for simpler controls
 */
function getTotalPages(totalContactsCount: number, contactsPerPage: ContactsPerPage): number {
    if (contactsPerPage === 'ALL') {
        return 1;
    }

    return Math.max(1, Math.ceil(totalContactsCount / contactsPerPage));
}

/**
 * Keep the selected page valid when filtering or inline editing changes the number of contacts
 */
function getValidCurrentPage(currentPage: number, totalPages: number): number {
    if (!Number.isFinite(currentPage)) {
        return FIRST_CONTACTS_PAGE;
    }

    return Math.min(Math.max(Math.floor(currentPage), FIRST_CONTACTS_PAGE), totalPages);
}

/**
 * Select one page of contacts without changing the complete filtered and sorted result
 */
export function paginateContacts(
    contacts: readonly Contact[],
    currentPage: number,
    contactsPerPage: ContactsPerPage,
): ContactsPage {
    const totalContactsCount = contacts.length;
    const totalPages = getTotalPages(totalContactsCount, contactsPerPage);
    const validCurrentPage = getValidCurrentPage(currentPage, totalPages);

    if (contactsPerPage === 'ALL') {
        return {
            pageContacts: contacts,
            currentPage: validCurrentPage,
            totalPages,
            totalContactsCount,
            firstContactNumber: totalContactsCount === 0 ? 0 : 1,
            lastContactNumber: totalContactsCount,
        };
    }

    const firstContactIndex = (validCurrentPage - 1) * contactsPerPage;
    const pageContacts = contacts.slice(firstContactIndex, firstContactIndex + contactsPerPage);
    const firstContactNumber = pageContacts.length === 0 ? 0 : firstContactIndex + 1;
    const lastContactNumber = pageContacts.length === 0 ? 0 : firstContactNumber + pageContacts.length - 1;

    return {
        pageContacts,
        currentPage: validCurrentPage,
        totalPages,
        totalContactsCount,
        firstContactNumber,
        lastContactNumber,
    };
}
