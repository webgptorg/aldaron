'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CONTACTS_PER_PAGE_OPTIONS,
    type ContactsPage,
    type ContactsPerPage,
} from '@/lib/contacts/paginateContacts';

const ALL_CONTACTS_PER_PAGE_LABEL = 'All contacts';

type ContactsPaginationProps = {
    readonly contactsPage: ContactsPage;
    readonly contactsPerPage: ContactsPerPage;
    readonly onChangePage: (page: number) => void;
    readonly onChangeContactsPerPage: (contactsPerPage: ContactsPerPage) => void;
};

/**
 * Turn the string emitted by the select into one of the supported page-size choices
 */
function parseContactsPerPage(contactsPerPageValue: string): ContactsPerPage {
    const contactsPerPage = CONTACTS_PER_PAGE_OPTIONS.find(
        (option) => option.toString() === contactsPerPageValue,
    );

    if (contactsPerPage === undefined) {
        throw new Error(`Unknown contacts-per-page value: ${contactsPerPageValue}`);
    }

    return contactsPerPage;
}

/**
 * Controls for choosing the visible table range and moving between its pages
 */
export function ContactsPagination(props: ContactsPaginationProps) {
    const { contactsPage, contactsPerPage, onChangePage, onChangeContactsPerPage } = props;
    const isOnFirstPage = contactsPage.currentPage === 1;
    const isOnLastPage = contactsPage.currentPage === contactsPage.totalPages;
    const isEmpty = contactsPage.totalContactsCount === 0;

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Contacts per page</span>
                <Select
                    value={contactsPerPage.toString()}
                    onValueChange={(contactsPerPageValue) =>
                        onChangeContactsPerPage(parseContactsPerPage(contactsPerPageValue))
                    }
                >
                    <SelectTrigger className="w-36" aria-label="Contacts per page">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CONTACTS_PER_PAGE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                                {option === 'ALL' ? ALL_CONTACTS_PER_PAGE_LABEL : option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>
                    {isEmpty
                        ? 'No matching contacts'
                        : `Showing ${contactsPage.firstContactNumber}–${contactsPage.lastContactNumber} of ${contactsPage.totalContactsCount} matching contacts`}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isOnFirstPage}
                    onClick={() => onChangePage(contactsPage.currentPage - 1)}
                >
                    ← Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {contactsPage.currentPage} of {contactsPage.totalPages}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isOnLastPage}
                    onClick={() => onChangePage(contactsPage.currentPage + 1)}
                >
                    Next →
                </Button>
            </div>
        </div>
    );
}
