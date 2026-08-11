import { downloadTextFile } from '@/lib/downloadTextFile';
import moment from 'moment';
import type { Contact } from './Contact';
import type { ContactsExportFormat } from './contactsExportFormats';

const EXPORT_FILE_NAME_PREFIX = 'contacts';
const EXPORT_FILE_NAME_DATE_FORMAT = 'YYYY-MM-DD-HHmm';

/**
 * Name of the exported file, stamped with the moment of the export so that repeated exports do not overwrite each other
 */
export function buildContactsExportFileName(format: ContactsExportFormat): string {
    return `${EXPORT_FILE_NAME_PREFIX}-${moment().format(EXPORT_FILE_NAME_DATE_FORMAT)}.${format.fileExtension}`;
}

/**
 * Sentence which says how many contacts are going to be downloaded and how narrow that selection is
 *
 * Note: Only the filter narrows the export down, splitting the table into pages never does
 */
export function describeContactsExportScope(exportedContactsCount: number, totalContactsCount: number): string {
    if (totalContactsCount === 0) {
        return 'no contacts';
    }

    if (exportedContactsCount === totalContactsCount) {
        return `all ${totalContactsCount} contacts`;
    }

    return `${exportedContactsCount} of ${totalContactsCount} contacts which match the filter, across all pages`;
}

/**
 * Serialize the given contacts and download them as a file
 *
 * Note: The caller decides the export scope by supplying the contacts to serialize
 */
export function exportContacts(contacts: readonly Contact[], format: ContactsExportFormat): void {
    downloadTextFile({
        fileName: buildContactsExportFileName(format),
        mimeType: format.mimeType,
        content: format.serialize(contacts),
    });
}
