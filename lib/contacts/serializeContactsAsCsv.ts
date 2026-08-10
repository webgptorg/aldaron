import type { Contact } from './Contact';
import { CONTACT_COLUMN_DEFINITIONS } from './contactColumnDefinitions';
import { formatContactValueForExport } from './contactValues';

const CSV_FIELD_SEPARATOR = ',';
const CSV_LINE_SEPARATOR = '\r\n';

/**
 * Byte order mark which tells spreadsheet editors that the file is UTF-8, otherwise they mangle the diacritics
 */
const UTF8_BYTE_ORDER_MARK = '\ufeff';

/**
 * Wrap the value in quotes and escape the quotes inside of it
 *
 * Note: Every field is quoted, so commas and newlines inside the values are safe
 */
function escapeCsvField(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Serialize one contact into one row of the CSV file
 */
function serializeContactAsCsvRow(contact: Contact): string {
    return CONTACT_COLUMN_DEFINITIONS.map((column) =>
        escapeCsvField(formatContactValueForExport(contact, column.key)),
    ).join(CSV_FIELD_SEPARATOR);
}

/**
 * Serialize the contacts into a CSV file
 *
 * Note: The columns and their order are shared with the contacts table, they are not repeated here
 */
export function serializeContactsAsCsv(contacts: readonly Contact[]): string {
    const headerRow = CONTACT_COLUMN_DEFINITIONS.map((column) => escapeCsvField(column.key)).join(CSV_FIELD_SEPARATOR);
    const contactRows = contacts.map(serializeContactAsCsvRow);

    return UTF8_BYTE_ORDER_MARK + [headerRow, ...contactRows].join(CSV_LINE_SEPARATOR) + CSV_LINE_SEPARATOR;
}
