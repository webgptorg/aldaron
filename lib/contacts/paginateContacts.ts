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
        return 1;
    }

    return Math.min(Math.max(Math.floor(currentPage), 1), totalPages);
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
