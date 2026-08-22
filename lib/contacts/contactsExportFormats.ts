import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import { serializeAdminJoinedContactsAsBook } from './serializeContactsAsBook';
import { serializeAdminJoinedContactsAsCsv } from './serializeContactsAsCsv';
import { serializeAdminJoinedContactsAsVcard } from './serializeContactsAsVcard';

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
    readonly serialize: (contacts: readonly AdminJoinedContact[]) => string;
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
        serialize: serializeAdminJoinedContactsAsCsv,
    },
    {
        id: 'VCARD',
        label: 'vCard',
        fileExtension: 'vcf',
        mimeType: 'text/vcard;charset=utf-8',
        serialize: serializeAdminJoinedContactsAsVcard,
    },
    {
        id: 'BOOK',
        label: 'AI context',
        fileExtension: 'book',
        mimeType: 'text/plain;charset=utf-8',
        serialize: serializeAdminJoinedContactsAsBook,
    },
];

/**
 * Find the export format which a link asks for
 *
 * Note: The letter case is ignored, so that a link to an export can also be written by hand
 *
 * @returns The format, or `null` when no format is called like that
 */
export function getContactsExportFormatOrNull(formatId: string): ContactsExportFormat | null {
    const normalizedFormatId = formatId.trim().toLowerCase();

    return CONTACTS_EXPORT_FORMATS.find((format) => format.id.toLowerCase() === normalizedFormatId) ?? null;
}
