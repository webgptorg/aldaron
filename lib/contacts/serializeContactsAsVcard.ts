import { serializeVcards } from '@/lib/exports/serializeVcards';
import { SITE_NAME } from '@/lib/metadata/site-config';
import {
    formatAdminContactRecords,
    formatAdminWorkshopParticipations,
    getAdminContactPhoneNumbers,
    type AdminJoinedContact,
} from '@/lib/admin/adminContactJoin';
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

type ContactVcardDetails = {
    readonly phone: string | null;
    readonly additionalNote: string | null;
};

function serializeContactVcards<ContactType extends Contact>(
    contacts: readonly ContactType[],
    getContactVcardDetails: (contact: ContactType) => ContactVcardDetails,
): string {
    return serializeVcards(
        contacts.map((contact) => {
            const contactVcardDetails = getContactVcardDetails(contact);

            return {
                uid: `contact-${contact.id}`,
                fullname: getContactDisplayName(contact),
                structuredFullname: contact.fullname ?? '',
                email: contact.email,
                phone: contactVcardDetails.phone,
                note: joinFilledParts(
                    [buildVcardNote(contact), contactVcardDetails.additionalNote],
                    VCARD_NOTE_LINE_SEPARATOR,
                ),
                revision: buildVcardRevision(contact),
            };
        }),
    );
}

/**
 * Serializes contacts with the same vCard 3.0 fields which the contact administration previously exported.
 */
export function serializeContactsAsVcard(contacts: readonly Contact[]): string {
    return serializeContactVcards(contacts, (contact) => ({ phone: contact.phone, additionalNote: null }));
}

/**
 * Serialize grouped admin contacts with their complete Contact history and workshop presence in the vCard note.
 */
export function serializeAdminJoinedContactsAsVcard(contacts: readonly AdminJoinedContact[]): string {
    return serializeContactVcards(contacts, (contact) => {
        const phoneNumbers = getAdminContactPhoneNumbers(contact.contactGroup);
        const additionalNote = joinFilledParts(
            [
                contact.contactGroup.normalizedEmail === null
                    ? null
                    : `Normalized email: ${contact.contactGroup.normalizedEmail}`,
                `Contact records:\n${formatAdminContactRecords(contact.contactGroup)}`,
                `Workshop participations:\n${formatAdminWorkshopParticipations(contact.contactGroup)}`,
            ],
            VCARD_NOTE_LINE_SEPARATOR,
        );

        return {
            phone: phoneNumbers[0] ?? contact.phone,
            additionalNote,
        };
    });
}
