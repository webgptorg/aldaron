'use client';

import { Button } from '@/components/ui/button';
import type { Contact } from '@/lib/contacts/Contact';
import { CONTACTS_EXPORT_FORMATS } from '@/lib/contacts/contactsExportFormats';
import { exportContacts } from '@/lib/contacts/exportContacts';
import { Download } from 'lucide-react';

type ContactsExportBarProps = {
    /**
     * Every contact loaded by the dashboard, regardless of the currently visible table page
     */
    readonly contacts: readonly Contact[];
};

/**
 * Download buttons of every export format together with the count of the contacts which are about to be exported
 */
export function ContactsExportBar(props: ContactsExportBarProps) {
    const { contacts } = props;

    const contactsCount = contacts.length;
    const isSomethingToExport = contactsCount > 0;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
                Exporting all <strong className="text-foreground">{contactsCount}</strong> contacts
            </span>
            {CONTACTS_EXPORT_FORMATS.map((format) => (
                <Button
                    key={format.id}
                    variant="outline"
                    disabled={!isSomethingToExport}
                    onClick={() => exportContacts(contacts, format)}
                    title={`Download all ${contactsCount} contacts as a ${format.label} file`}
                >
                    <Download className="mr-2 h-4 w-4" />
                    {format.label} ({contactsCount})
                </Button>
            ))}
        </div>
    );
}
