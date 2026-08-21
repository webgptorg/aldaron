import { serializeVcards } from '@/lib/exports/serializeVcards';
import { SITE_NAME } from '@/lib/metadata/site-config';
import type { Contact } from './Contact';
import { parseContactDate } from './contactDates';
import { getContactDisplayName } from './contactValues';

const VCARD_NOTE_LINE_SEPARATOR = '\n';
const VCARD_NOTE_HEADLINE_PREFIX = `${SITE_NAME} contact`;
const VCARD_NOTE_ORIGIN_SEPARATOR = ' -> ';

function joinFilledParts(parts: ReadonlyArray<string | null>, separator: string): string {
    return parts
        .map((part) => part?.trim() ?? '')
        .filter((part) => part !== '')
        .join(separator);
}

function buildVcardNoteHeadline(contact: Contact): string {
    const origin = joinFilledParts([contact.appName, contact.placeName], VCARD_NOTE_ORIGIN_SEPARATOR);
    return origin === '' ? VCARD_NOTE_HEADLINE_PREFIX : `${VCARD_NOTE_HEADLINE_PREFIX} from ${origin}`;
}

function buildVcardNote(contact: Contact): string {
    return joinFilledParts(
        [buildVcardNoteHeadline(contact), contact.userNote, contact.ourNote],
        VCARD_NOTE_LINE_SEPARATOR,
    );
}

function buildVcardRevision(contact: Contact): string | null {
    const createdAtMoment = parseContactDate(contact.createdAt);
    return createdAtMoment === null ? null : createdAtMoment.toISOString();
}

/**
 * Serializes contacts with the same vCard 3.0 fields which the contact administration previously exported.
 */
export function serializeContactsAsVcard(contacts: readonly Contact[]): string {
    return serializeVcards(
        contacts.map((contact) => ({
            uid: `contact-${contact.id}`,
            fullname: getContactDisplayName(contact),
            structuredFullname: contact.fullname ?? '',
            email: contact.email,
            phone: contact.phone,
            note: buildVcardNote(contact),
            revision: buildVcardRevision(contact),
        })),
    );
}
