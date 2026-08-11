'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createContactDraftFromContact, type Contact, type ContactDraft } from '@/lib/contacts/Contact';
import { ContactForm } from './ContactForm';

type EditContactDialogProps = {
    readonly contact: Contact;
    readonly onEditContact: (contactId: number, contactDraft: ContactDraft) => Promise<boolean>;
    readonly onClose: () => void;
};

/**
 * Dialog for changing the contact details that are also available when adding a contact manually
 */
export function EditContactDialog(props: EditContactDialogProps) {
    const { contact, onEditContact, onClose } = props;

    return (
        <Dialog
            open
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Contact</DialogTitle>
                    <DialogDescription>
                        Update the contact details. The contacted status and our internal note stay editable in the
                        table.
                    </DialogDescription>
                </DialogHeader>
                <ContactForm
                    key={contact.id}
                    initialContactDraft={createContactDraftFromContact(contact)}
                    saveButtonLabel="Save Changes"
                    onSaveContact={(contactDraft) => onEditContact(contact.id, contactDraft)}
                    onContactSaved={onClose}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
