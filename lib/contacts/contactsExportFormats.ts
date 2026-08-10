import type { Contact } from './Contact';
import { serializeContactsAsCsv } from './serializeContactsAsCsv';
import { serializeContactsAsVcard } from './serializeContactsAsVcard';

/**
 * One file format the contacts can be exported to
 *
 * Note: Adding another format here is enough, the dashboard renders one export button per format
 */
export type ContactsExportFormat = {
    readonly id: string;
    readonly label: string;
    readonly fileExtension: string;
    readonly mimeType: string;
    readonly serialize: (contacts: readonly Contact[]) => string;
};

/**
 * All file formats the contacts can be exported to
 */
export const CONTACTS_EXPORT_FORMATS: readonly ContactsExportFormat[] = [
    {
        id: 'CSV',
        label: 'CSV',
        fileExtension: 'csv',
        mimeType: 'text/csv;charset=utf-8',
        serialize: serializeContactsAsCsv,
    },
    {
        id: 'VCARD',
        label: 'vCard',
        fileExtension: 'vcf',
        mimeType: 'text/vcard;charset=utf-8',
        serialize: serializeContactsAsVcard,
    },
];
