'use client';

import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import { CONTACTS_EXPORT_FORMATS } from '@/lib/contacts/contactsExportFormats';
import type { ContactsSelection } from '@/lib/contacts/contactsSelection';
import { buildContactsExportUrl, describeContactsExportScope } from '@/lib/contacts/exportContacts';
import { ContactsExportButton } from './ContactsExportButton';

type ContactsExportBarProps = {
    /**
     * The current view of the contacts, which is every contact matching the filter, in the order of the table
     *
     * Note: The pages of the table never narrow this down, every matching contact is exported
     */
    readonly exportedContacts: readonly AdminJoinedContact[];

    /**
     * How many contacts the dashboard has loaded altogether, to say how much of them the current view is
     */
    readonly totalContactsCount: number;

    /**
     * The very same view written as a filter and a sorting, which the link to an export in a new tab carries
     */
    readonly contactsSelection: ContactsSelection;

    /**
     * Token which opens the dashboard, with which an export in a new tab authenticates itself as well
     */
    readonly adminToken: string | null;
};

/**
 * Export buttons of every format together with the scope of the contacts which are about to be exported
 */
export function ContactsExportBar(props: ContactsExportBarProps) {
    const { exportedContacts, totalContactsCount, contactsSelection, adminToken } = props;

    const exportScopeDescription = describeContactsExportScope(exportedContacts.length, totalContactsCount);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
                Exporting <strong className="text-foreground">{exportScopeDescription}</strong>
            </span>
            {CONTACTS_EXPORT_FORMATS.map((format) => (
                <ContactsExportButton
                    key={format.id}
                    format={format}
                    exportedContacts={exportedContacts}
                    exportUrl={buildContactsExportUrl(format, adminToken, contactsSelection)}
                    exportScopeDescription={exportScopeDescription}
                />
            ))}
        </div>
    );
}
