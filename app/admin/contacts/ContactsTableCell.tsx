'use client';

import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Contact, ContactChanges } from '@/lib/contacts/Contact';
import {
    MULTILINE_CONTACT_CELL_LINE_COUNT,
    type ContactColumnDefinition,
} from '@/lib/contacts/contactColumnDefinitions';
import { formatContactValueForDisplay } from '@/lib/contacts/contactValues';
import { TruncatedText } from './TruncatedText';

type ContactsTableCellProps = {
    readonly contact: Contact;
    readonly column: ContactColumnDefinition;
    readonly onChangeContact: (contactId: number, contactChanges: ContactChanges) => void;
};

/**
 * Value of one contact in one column, rendered the way the column definition asks for
 */
export function ContactsTableCell(props: ContactsTableCellProps) {
    const { contact, column, onChangeContact } = props;

    if (column.cellKind === 'CONTACTED_SWITCH') {
        return (
            <Switch
                checked={contact.isContacted === true}
                onCheckedChange={(isContacted) => onChangeContact(contact.id, { isContacted })}
            />
        );
    }

    if (column.cellKind === 'EDITABLE_NOTE') {
        return (
            <Textarea
                className="w-full min-h-[100px]"
                value={contact.ourNote ?? ''}
                onChange={(changeEvent) => onChangeContact(contact.id, { ourNote: changeEvent.target.value })}
            />
        );
    }

    return (
        <TruncatedText
            text={formatContactValueForDisplay(contact, column.key)}
            lineCount={column.cellKind === 'MULTILINE_TEXT' ? MULTILINE_CONTACT_CELL_LINE_COUNT : 1}
        />
    );
}
