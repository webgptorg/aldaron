'use client';

import { Button } from '@/components/ui/button';
import type { Contact } from '@/lib/contacts/Contact';
import { useState } from 'react';

type ContactActionsProps = {
    readonly contact: Contact;
    readonly onEditContact: (contact: Contact) => void;
    readonly onDeleteContact: (contactId: number) => Promise<boolean>;
};

/**
 * Describe a contact in the delete confirmation even when it was submitted without a name
 */
function getContactDescription(contact: Contact): string {
    return contact.fullname || contact.email || `contact #${contact.id}`;
}

/**
 * Explicit actions for one row of the contacts table
 */
export function ContactActions(props: ContactActionsProps) {
    const { contact, onEditContact, onDeleteContact } = props;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteContact = async () => {
        if (isDeleting) {
            return;
        }

        const isDeletionConfirmed = window.confirm(`Delete ${getContactDescription(contact)} permanently?`);
        if (!isDeletionConfirmed) {
            return;
        }

        setIsDeleting(true);
        const isDeleted = await onDeleteContact(contact.id);

        if (!isDeleted) {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => onEditContact(contact)}
            >
                Edit
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={isDeleting} onClick={handleDeleteContact}>
                {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
        </div>
    );
}
