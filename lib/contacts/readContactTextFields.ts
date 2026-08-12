import { MAXIMAL_CONTACT_TEXT_LENGTH, type ContactTextColumnKey } from '@/lib/contacts/Contact';

/**
 * Text fields of a contact as they were read out of a request body
 */
export type ContactTextFields<FieldName extends ContactTextColumnKey> = {
    readonly [Name in FieldName]?: string | null;
};

/**
 * Read only the named text fields out of a request body, with a field which was left empty stored as no value at all
 *
 * Note: A field which was not sent at all is left out, so that changing one field never overwrites another one.
 *
 * Note: Answers `null` when one of the fields is sent as something else than a text, or is longer than a contact may
 *       ever be, so that a malformed request never reaches the database.
 */
export function readContactTextFields<FieldName extends ContactTextColumnKey>(
    body: Readonly<Record<string, unknown>>,
    fieldNames: readonly FieldName[],
): ContactTextFields<FieldName> | null {
    const contactTextFields: { [Name in FieldName]?: string | null } = {};

    for (const fieldName of fieldNames) {
        const fieldValue = body[fieldName];

        if (fieldValue === undefined) {
            continue;
        }

        if (typeof fieldValue !== 'string' || fieldValue.length > MAXIMAL_CONTACT_TEXT_LENGTH) {
            return null;
        }

        contactTextFields[fieldName] = fieldValue || null;
    }

    return contactTextFields;
}
