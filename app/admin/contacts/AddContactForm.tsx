'use client';

import type { ContactDraft } from '@/lib/contacts/Contact';
import { EMPTY_CONTACT_DRAFT } from '@/lib/contacts/Contact';
import { ContactForm } from './ContactForm';

type AddContactFormProps = {
    readonly onAddContact: (contactDraft: ContactDraft) => Promise<boolean>;
    readonly onContactAdded: () => void;
};

/**
 * Form which adds one contact filled in by hand
 */
export function AddContactForm(props: AddContactFormProps) {
    const { onAddContact, onContactAdded } = props;

    return (
        <div className="mb-6 rounded-lg border bg-muted/30 p-4">
            <h2 className="mb-4 text-xl font-semibold">Add New Contact</h2>
            <ContactForm
                initialContactDraft={EMPTY_CONTACT_DRAFT}
                saveButtonLabel="Save Contact"
                onSaveContact={onAddContact}
                onContactSaved={onContactAdded}
            />
        </div>
    );
}
