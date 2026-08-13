import { SITE_NAME } from '@/lib/metadata/site-config';
import type { Contact } from './Contact';
import { parseContactDate } from './contactDates';
import { getContactDisplayName } from './contactValues';

const VCARD_LINE_SEPARATOR = '\r\n';

/**
 * vCard 3.0 is the version which Google Contacts, Apple Contacts and Outlook all understand
 */
const VCARD_VERSION = '3.0';

/**
 * Lines longer than this many characters have to be folded, as required by the vCard specification
 *
 * @see https://datatracker.ietf.org/doc/html/rfc2426
 */
const VCARD_MAXIMAL_LINE_LENGTH = 75;

/**
 * A continuation line starts with a single space, which counts into the length of the line
 */
const VCARD_MAXIMAL_CONTINUATION_LINE_LENGTH = VCARD_MAXIMAL_LINE_LENGTH - 1;

/**
 * Separator between the lines of the note, which the escaping turns into the `\n` the vCard specification asks for
 */
const VCARD_NOTE_LINE_SEPARATOR = '\n';

/**
 * Opening of the note, which says that the card comes from us and not from the address book of somebody else
 */
const VCARD_NOTE_HEADLINE_PREFIX = `${SITE_NAME} contact`;

/**
 * Separator between the application and the place inside the headline of the note
 */
const VCARD_NOTE_ORIGIN_SEPARATOR = ' -> ';

/**
 * Escape the characters which have a special meaning in a vCard value
 */
function escapeVcardValue(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\r|\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

/**
 * Break a long line into a first line and continuation lines which start with a single space
 */
function foldVcardLine(line: string): string {
    if (line.length <= VCARD_MAXIMAL_LINE_LENGTH) {
        return line;
    }

    const foldedLines: Array<string> = [line.slice(0, VCARD_MAXIMAL_LINE_LENGTH)];
    let restOfLine = line.slice(VCARD_MAXIMAL_LINE_LENGTH);

    while (restOfLine.length > 0) {
        foldedLines.push(` ${restOfLine.slice(0, VCARD_MAXIMAL_CONTINUATION_LINE_LENGTH)}`);
        restOfLine = restOfLine.slice(VCARD_MAXIMAL_CONTINUATION_LINE_LENGTH);
    }

    return foldedLines.join(VCARD_LINE_SEPARATOR);
}

/**
 * One line of a vCard whose value is built out of several components, or `null` when there is nothing to write
 *
 * Note: The semicolons which separate the components are a part of the structure, only the components are escaped
 */
function buildVcardStructuredLine(propertyName: string, valueComponents: readonly string[]): string | null {
    if (valueComponents.every((valueComponent) => valueComponent.trim() === '')) {
        return null;
    }

    return foldVcardLine(`${propertyName}:${valueComponents.map(escapeVcardValue).join(';')}`);
}

/**
 * One `PROPERTY:value` line of a vCard, or `null` when there is no value to write
 */
function buildVcardLine(propertyName: string, value: string): string | null {
    return buildVcardStructuredLine(propertyName, [value]);
}

/**
 * Split the full name into the given name(s) and the family name
 *
 * Note: The last word is taken as the family name, which is how both Czech and English names are written
 */
function splitFullnameIntoNameParts(fullname: string): { readonly givenName: string; readonly familyName: string } {
    const nameParts = fullname.trim().split(/\s+/).filter(Boolean);

    if (nameParts.length === 0) {
        return { givenName: '', familyName: '' };
    }

    if (nameParts.length === 1) {
        return { givenName: nameParts[0], familyName: '' };
    }

    return { givenName: nameParts.slice(0, -1).join(' '), familyName: nameParts[nameParts.length - 1] };
}

/**
 * Trim the parts and join only the ones which are filled in, so that no separator ever dangles around a missing part
 */
function joinFilledParts(parts: ReadonlyArray<string | null>, separator: string): string {
    return parts
        .map((part) => part?.trim() ?? '')
        .filter((part) => part !== '')
        .join(separator);
}

/**
 * First line of the note, which says where the contact was gathered, for example
 * `Promptbook contact from Landing page -> OnlineWorkshopRegistration`
 */
function buildVcardNoteHeadline(contact: Contact): string {
    const origin = joinFilledParts([contact.appName, contact.placeName], VCARD_NOTE_ORIGIN_SEPARATOR);

    return origin === '' ? VCARD_NOTE_HEADLINE_PREFIX : `${VCARD_NOTE_HEADLINE_PREFIX} from ${origin}`;
}

/**
 * Everything worth knowing about the contact which no standard vCard property can hold, which is where the contact
 * comes from, what they wrote to us themselves and what we noted about them, each of them only when it is filled in
 *
 * Note: Whether we have already contacted them is our own workflow, an address book has no use for it
 */
function buildVcardNote(contact: Contact): string {
    return joinFilledParts(
        [buildVcardNoteHeadline(contact), contact.userNote, contact.ourNote],
        VCARD_NOTE_LINE_SEPARATOR,
    );
}

/**
 * Timestamp of the last revision of the card, which the vCard specification requires in the ISO 8601 format
 */
function buildVcardRevision(contact: Contact): string {
    const createdAtMoment = parseContactDate(contact.createdAt);

    return createdAtMoment === null ? '' : createdAtMoment.toISOString();
}

/**
 * Serialize one contact into one vCard
 *
 * Note: There is no `ORG` and no `URL`, because the application, the place and the address describe the landing page
 *       where the contact was gathered, never the organization or the website of the contact themselves
 */
function serializeContactAsVcard(contact: Contact): string {
    const { givenName, familyName } = splitFullnameIntoNameParts(contact.fullname ?? '');

    const vcardLines = [
        'BEGIN:VCARD',
        `VERSION:${VCARD_VERSION}`,
        buildVcardStructuredLine('N', [familyName, givenName, '', '', '']),
        buildVcardLine('FN', getContactDisplayName(contact)),
        buildVcardLine('EMAIL;TYPE=INTERNET', contact.email ?? ''),
        buildVcardLine('TEL;TYPE=CELL', contact.phone ?? ''),
        buildVcardLine('NOTE', buildVcardNote(contact)),
        buildVcardLine('REV', buildVcardRevision(contact)),
        `UID:contact-${contact.id}`,
        'END:VCARD',
    ];

    return vcardLines.filter(Boolean).join(VCARD_LINE_SEPARATOR);
}

/**
 * Serialize the contacts into a vCard file which can be imported into any address book
 */
export function serializeContactsAsVcard(contacts: readonly Contact[]): string {
    return contacts.map(serializeContactAsVcard).join(VCARD_LINE_SEPARATOR) + VCARD_LINE_SEPARATOR;
}
