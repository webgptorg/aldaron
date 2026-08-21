const VCARD_LINE_SEPARATOR = '\r\n';
const VCARD_VERSION = '3.0';
const VCARD_MAXIMAL_LINE_LENGTH = 75;
const VCARD_MAXIMAL_CONTINUATION_LINE_LENGTH = VCARD_MAXIMAL_LINE_LENGTH - 1;

export type VcardContact = {
    /**
     * The human-readable name shown in address books when no structured name is available.
     */
    readonly fullname: string;
    /**
     * The name used to build the surname / given-name vCard field, when it differs from the display name.
     */
    readonly structuredFullname?: string;
    readonly email?: string | null;
    readonly phone?: string | null;
    readonly note?: string | null;
    readonly revision?: string | null;
    readonly uid: string;
};

/**
 * Escapes the characters that have a special meaning in an RFC 2426 value.
 */
function escapeVcardValue(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\r|\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

/**
 * Folds long lines so the exported card remains interoperable with address-book applications.
 */
function foldVcardLine(line: string): string {
    if (line.length <= VCARD_MAXIMAL_LINE_LENGTH) {
        return line;
    }

    const foldedLines: string[] = [line.slice(0, VCARD_MAXIMAL_LINE_LENGTH)];
    let remainingLine = line.slice(VCARD_MAXIMAL_LINE_LENGTH);

    while (remainingLine.length > 0) {
        foldedLines.push(` ${remainingLine.slice(0, VCARD_MAXIMAL_CONTINUATION_LINE_LENGTH)}`);
        remainingLine = remainingLine.slice(VCARD_MAXIMAL_CONTINUATION_LINE_LENGTH);
    }

    return foldedLines.join(VCARD_LINE_SEPARATOR);
}

function buildVcardStructuredLine(propertyName: string, valueComponents: readonly string[]): string | null {
    if (valueComponents.every((valueComponent) => valueComponent.trim() === '')) {
        return null;
    }

    return foldVcardLine(`${propertyName}:${valueComponents.map(escapeVcardValue).join(';')}`);
}

function buildVcardLine(propertyName: string, value: string | null | undefined): string | null {
    return buildVcardStructuredLine(propertyName, [value ?? '']);
}

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

function serializeVcard(contact: VcardContact): string {
    const { givenName, familyName } = splitFullnameIntoNameParts(contact.structuredFullname ?? contact.fullname);
    const vcardLines = [
        'BEGIN:VCARD',
        `VERSION:${VCARD_VERSION}`,
        buildVcardStructuredLine('N', [familyName, givenName, '', '', '']),
        buildVcardLine('FN', contact.fullname),
        buildVcardLine('EMAIL;TYPE=INTERNET', contact.email),
        buildVcardLine('TEL;TYPE=CELL', contact.phone),
        buildVcardLine('NOTE', contact.note),
        buildVcardLine('REV', contact.revision),
        buildVcardLine('UID', contact.uid),
        'END:VCARD',
    ];

    return vcardLines.filter(Boolean).join(VCARD_LINE_SEPARATOR);
}

/**
 * Serializes contacts as vCard 3.0, a format imported by Google Contacts, Apple Contacts, and Outlook.
 */
export function serializeVcards(contacts: readonly VcardContact[]): string {
    return contacts.map(serializeVcard).join(VCARD_LINE_SEPARATOR) + VCARD_LINE_SEPARATOR;
}
