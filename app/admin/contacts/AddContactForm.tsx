'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ContactDraft } from '@/lib/contacts/Contact';
import { EMPTY_CONTACT_DRAFT } from '@/lib/contacts/Contact';
import { useState } from 'react';

/**
 * Single line fields of the form, so that they are not repeated for every single one of them
 */
const CONTACT_DRAFT_FIELDS: readonly {
    readonly key: keyof ContactDraft;
    readonly label: string;
    readonly inputType: string;
}[] = [
    { key: 'fullname', label: 'Full Name', inputType: 'text' },
    { key: 'email', label: 'Email', inputType: 'email' },
    { key: 'phone', label: 'Phone', inputType: 'tel' },
    { key: 'appName', label: 'App Name', inputType: 'text' },
    { key: 'placeName', label: 'Place Name', inputType: 'text' },
];

type AddContactFormProps = {
    readonly onAddContact: (contactDraft: ContactDraft) => Promise<boolean>;
};

/**
 * Form which adds one contact filled in by hand
 */
export function AddContactForm(props: AddContactFormProps) {
    const { onAddContact } = props;

    const [contactDraft, setContactDraft] = useState<ContactDraft>(EMPTY_CONTACT_DRAFT);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveContact = async () => {
        setIsSaving(true);
        const isAdded = await onAddContact(contactDraft);
        setIsSaving(false);

        if (isAdded) {
            setContactDraft(EMPTY_CONTACT_DRAFT);
        }
    };

    return (
        <div className="mb-6 rounded-lg border bg-muted/30 p-4">
            <h2 className="mb-4 text-xl font-semibold">Add New Contact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {CONTACT_DRAFT_FIELDS.map((field) => (
                    <div key={field.key}>
                        <label className="mb-1 block text-sm font-medium">{field.label}</label>
                        <Input
                            type={field.inputType}
                            value={contactDraft[field.key]}
                            onChange={(changeEvent) =>
                                setContactDraft({ ...contactDraft, [field.key]: changeEvent.target.value })
                            }
                        />
                    </div>
                ))}
                <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium">User Note</label>
                    <Textarea
                        className="w-full"
                        value={contactDraft.userNote}
                        onChange={(changeEvent) =>
                            setContactDraft({ ...contactDraft, userNote: changeEvent.target.value })
                        }
                    />
                </div>
            </div>
            <Button className="mt-4" disabled={isSaving} onClick={handleSaveContact}>
                {isSaving ? 'Saving...' : 'Save Contact'}
            </Button>
        </div>
    );
}
