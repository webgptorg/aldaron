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
 * Serialize the given contacts and download them as a file
 *
 * Note: Whatever is passed in is exported, so the dashboard always exports exactly the contacts which are on the screen
 */
export function exportContacts(contacts: readonly Contact[], format: ContactsExportFormat): void {
    downloadTextFile({
        fileName: buildContactsExportFileName(format),
        mimeType: format.mimeType,
        content: format.serialize(contacts),
    });
}
