import {
    formatAdminContactRecords,
    formatAdminWorkshopFeedbacks,
    formatAdminWorkshopParticipations,
    type AdminJoinedContact,
} from '@/lib/admin/adminContactJoin';
import { SITE_NAME } from '@/lib/metadata/site-config';
import moment from 'moment';
import { getContactDisplayName } from './contactValues';

const BOOK_DATE_FORMAT = 'YYYY-MM-DD';
const BOOK_SECTION_SEPARATOR = '\n\n';
const BOOK_CONTACT_SEPARATOR = '\n\n\n';
const EMPTY_BOOK_SECTION_VALUE = 'No information recorded.';

function formatBookSection(title: string, content: string): string {
    return `${title}:\n${content === '' ? EMPTY_BOOK_SECTION_VALUE : content}`;
}

function serializeAdminJoinedContactAsBook(contact: AdminJoinedContact): string {
    return [
        `CONTACT ${getContactDisplayName(contact)}`,
        `Normalized email: ${contact.contactGroup.normalizedEmail ?? EMPTY_BOOK_SECTION_VALUE}`,
        formatBookSection('Contact records', formatAdminContactRecords(contact.contactGroup)),
        formatBookSection('Workshop attendance', formatAdminWorkshopParticipations(contact.contactGroup)),
        formatBookSection('Workshop feedback', formatAdminWorkshopFeedbacks(contact.contactGroup)),
    ].join(BOOK_SECTION_SEPARATOR);
}

/**
 * Serialize the selected contacts as a Book-style context document for an AI agent.
 *
 * Every CONTACT keeps all source Contact records, workshop attendance, and feedback, rather than merely the merged
 * values which the contacts table displays.
 */
export function serializeAdminJoinedContactsAsBook(
    contacts: readonly AdminJoinedContact[],
    exportedOn = moment().format(BOOK_DATE_FORMAT),
): string {
    const bookHeader = [
        `Contacts ${exportedOn}`,
        `NOTE These are the contacts exported from the ${SITE_NAME} contacts administration. Each CONTACT contains all known contact records, workshop attendance activity, and workshop feedback at the time of export.`,
    ].join(BOOK_SECTION_SEPARATOR);

    return [
        bookHeader,
        ...contacts.map(serializeAdminJoinedContactAsBook),
    ].join(BOOK_CONTACT_SEPARATOR);
}
