'use client';

import { Button } from '@/components/ui/button';
import type { Contact } from '@/lib/contacts/Contact';
import { CONTACTS_EXPORT_FORMATS } from '@/lib/contacts/contactsExportFormats';
import { describeContactsExportScope, exportContacts } from '@/lib/contacts/exportContacts';
import { Download } from 'lucide-react';

type ContactsExportBarProps = {
    /**
     * The current view of the contacts, which is every contact matching the filter, in the order of the table
     *
     * Note: The pages of the table never narrow this down, every matching contact is exported
     */
    readonly exportedContacts: readonly Contact[];

    /**
     * How many contacts the dashboard has loaded altogether, to say how much of them the current view is
     */
    readonly totalContactsCount: number;
};

/**
 * Download buttons of every export format together with the scope of the contacts which are about to be exported
 */
export function ContactsExportBar(props: ContactsExportBarProps) {
    const { exportedContacts, totalContactsCount } = props;

    const exportedContactsCount = exportedContacts.length;
    const isSomethingToExport = exportedContactsCount > 0;
    const exportScopeDescription = describeContactsExportScope(exportedContactsCount, totalContactsCount);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
                Exporting <strong className="text-foreground">{exportScopeDescription}</strong>
            </span>
            {CONTACTS_EXPORT_FORMATS.map((format) => (
                <Button
                    key={format.id}
                    variant="outline"
                    disabled={!isSomethingToExport}
                    onClick={() => exportContacts(exportedContacts, format)}
                    title={`Download the ${format.label} file with ${exportScopeDescription}`}
                >
                    <Download className="mr-2 h-4 w-4" />
                    {format.label} ({exportedContactsCount})
                </Button>
            ))}
        </div>
    );
}
