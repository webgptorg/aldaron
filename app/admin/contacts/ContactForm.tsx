'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ContactEditableTextFieldName, ContactTextValues } from '@/lib/contacts/Contact';
import { getContactColumnDefinition } from '@/lib/contacts/contactColumnDefinitions';
import type { FormEvent } from 'react';
import { useState } from 'react';

/**
 * How one contact field is filled in
 *
 * Note: The label is not written down here, both the contacts table and this form read it from the column definition
 */
type ContactFormFieldControl = {
    readonly fieldName: ContactEditableTextFieldName;
    readonly inputType?: string;
    readonly isMultiline?: boolean;
};

/**
 * Every field a contact form can offer, in the order in which they are shown
 *
 * Note: The notes come last, because each of them takes the full width of the form
 */
const CONTACT_FORM_FIELD_CONTROLS: readonly ContactFormFieldControl[] = [
    { fieldName: 'fullname', inputType: 'text' },
    { fieldName: 'email', inputType: 'email' },
    { fieldName: 'phone', inputType: 'tel' },
    { fieldName: 'appName', inputType: 'text' },
    { fieldName: 'placeName', inputType: 'text' },
    { fieldName: 'userNote', isMultiline: true },
    { fieldName: 'ourNote', isMultiline: true },
];

type ContactFormProps<FieldName extends ContactEditableTextFieldName> = {
    readonly fieldNames: readonly FieldName[];
    readonly initialContactValues: ContactTextValues<FieldName>;
    readonly saveButtonLabel: string;
    readonly onSaveContact: (contactValues: ContactTextValues<FieldName>) => Promise<boolean>;
    readonly onContactSaved?: () => void;
    readonly onCancel?: () => void;
};

/**
 * Fields shared by the add-contact panel and the edit-contact dialog, only the ones the caller asks for
 */
export function ContactForm<FieldName extends ContactEditableTextFieldName>(props: ContactFormProps<FieldName>) {
    const { fieldNames, initialContactValues, saveButtonLabel, onSaveContact, onContactSaved, onCancel } = props;

    const [contactValues, setContactValues] = useState<ContactTextValues<FieldName>>(initialContactValues);
    const [isSaving, setIsSaving] = useState(false);

    const shownFieldControls = CONTACT_FORM_FIELD_CONTROLS.filter(
        (fieldControl): fieldControl is ContactFormFieldControl & { readonly fieldName: FieldName } =>
            (fieldNames as readonly ContactEditableTextFieldName[]).includes(fieldControl.fieldName),
    );

    const changeContactValue = (fieldName: FieldName, fieldValue: string) => {
        setContactValues((previousContactValues) => ({ ...previousContactValues, [fieldName]: fieldValue }));
    };

    const handleSaveContact = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);

        let isSaved = false;
        try {
            isSaved = await onSaveContact(contactValues);
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
                {shownFieldControls.map((fieldControl) => (
                    <label
                        key={fieldControl.fieldName}
                        className={fieldControl.isMultiline ? 'sm:col-span-2' : undefined}
                    >
                        <span className="mb-1 block text-sm font-medium">
                            {getContactColumnDefinition(fieldControl.fieldName).label}
                        </span>
                        {fieldControl.isMultiline ? (
                            <Textarea
                                className="w-full"
                                value={contactValues[fieldControl.fieldName]}
                                onChange={(event) => changeContactValue(fieldControl.fieldName, event.target.value)}
                            />
                        ) : (
                            <Input
                                type={fieldControl.inputType}
                                value={contactValues[fieldControl.fieldName]}
                                onChange={(event) => changeContactValue(fieldControl.fieldName, event.target.value)}
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
