'use client';

import { Button } from '@/components/ui/button';
import type { Contact } from '@/lib/contacts/Contact';
import { CONTACTS_EXPORT_FORMATS } from '@/lib/contacts/contactsExportFormats';
import { exportContacts } from '@/lib/contacts/exportContacts';
import { Download } from 'lucide-react';

type ContactsExportBarProps = {
    /**
     * Exactly the contacts which are shown in the table right now, they are the ones which get exported
     */
    readonly exportedContacts: readonly Contact[];

    readonly totalContactsCount: number;
};

/**
 * Download buttons of every export format together with the count of the contacts which are about to be exported
 */
export function ContactsExportBar(props: ContactsExportBarProps) {
    const { exportedContacts, totalContactsCount } = props;

    const isSomethingToExport = exportedContacts.length > 0;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
                Exporting the current view: <strong className="text-foreground">{exportedContacts.length}</strong> of{' '}
                {totalContactsCount} contacts
            </span>
            {CONTACTS_EXPORT_FORMATS.map((format) => (
                <Button
                    key={format.id}
                    variant="outline"
                    disabled={!isSomethingToExport}
                    onClick={() => exportContacts(exportedContacts, format)}
                    title={`Download the ${exportedContacts.length} shown contacts as a ${format.label} file`}
                >
                    <Download className="mr-2 h-4 w-4" />
                    {format.label} ({exportedContacts.length})
                </Button>
            ))}
        </div>
    );
}
