'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ContactDraft, ContactDraftFieldName } from '@/lib/contacts/Contact';
import type { FormEvent } from 'react';
import { useState } from 'react';

/**
 * Fields of the form, so their labels and controls are defined only once for both adding and editing a contact
 */
const CONTACT_FORM_FIELDS: readonly {
    readonly key: ContactDraftFieldName;
    readonly label: string;
    readonly inputType?: string;
    readonly isMultiline?: boolean;
}[] = [
    { key: 'fullname', label: 'Full Name', inputType: 'text' },
    { key: 'email', label: 'Email', inputType: 'email' },
    { key: 'phone', label: 'Phone', inputType: 'tel' },
    { key: 'appName', label: 'App Name', inputType: 'text' },
    { key: 'placeName', label: 'Place Name', inputType: 'text' },
    { key: 'userNote', label: 'User Note', isMultiline: true },
];

type ContactFormProps = {
    readonly initialContactDraft: ContactDraft;
    readonly saveButtonLabel: string;
    readonly onSaveContact: (contactDraft: ContactDraft) => Promise<boolean>;
    readonly onContactSaved?: () => void;
    readonly onCancel?: () => void;
};

/**
 * Fields shared by the add-contact panel and the edit-contact dialog
 */
export function ContactForm(props: ContactFormProps) {
    const { initialContactDraft, saveButtonLabel, onSaveContact, onContactSaved, onCancel } = props;

    const [contactDraft, setContactDraft] = useState<ContactDraft>(initialContactDraft);
    const [isSaving, setIsSaving] = useState(false);

    const changeContactDraftValue = (fieldName: ContactDraftFieldName, fieldValue: string) => {
        setContactDraft((previousContactDraft) => ({ ...previousContactDraft, [fieldName]: fieldValue }));
    };

    const handleSaveContact = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);

        let isSaved = false;
        try {
            isSaved = await onSaveContact(contactDraft);
        } finally {
            setIsSaving(false);
        }

        if (isSaved) {
            onContactSaved?.();
        }
    };

    return (
        <form onSubmit={handleSaveContact}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {CONTACT_FORM_FIELDS.map((field) => (
                    <label key={field.key} className={field.isMultiline ? 'sm:col-span-2' : undefined}>
                        <span className="mb-1 block text-sm font-medium">{field.label}</span>
                        {field.isMultiline ? (
                            <Textarea
                                className="w-full"
                                value={contactDraft[field.key]}
                                onChange={(event) => changeContactDraftValue(field.key, event.target.value)}
                            />
                        ) : (
                            <Input
                                type={field.inputType}
                                value={contactDraft[field.key]}
                                onChange={(event) => changeContactDraftValue(field.key, event.target.value)}
                            />
                        )}
                    </label>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : saveButtonLabel}
                </Button>
                {onCancel !== undefined && (
                    <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
