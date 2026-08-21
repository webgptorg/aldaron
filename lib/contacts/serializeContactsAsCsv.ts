import type { Contact } from './Contact';
import { CONTACT_COLUMN_DEFINITIONS } from './contactColumnDefinitions';
import { formatContactValueForExport } from './contactValues';
import { serializeRowsAsCsv } from '@/lib/exports/serializeRowsAsCsv';

/**
 * Serialize the contacts into a CSV file
 *
 * Note: The columns and their order are shared with the contacts table, they are not repeated here
 */
export function serializeContactsAsCsv(contacts: readonly Contact[]): string {
    return serializeRowsAsCsv(
        contacts,
        CONTACT_COLUMN_DEFINITIONS.map((column) => ({
            header: column.key,
            getValue: (contact: Contact) => formatContactValueForExport(contact, column.key),
        })),
    );
}
