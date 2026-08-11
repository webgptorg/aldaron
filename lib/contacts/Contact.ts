/**
 * One contact (lead) as stored in the `Contact` table
 *
 * Note: The shape mirrors the database table, the admin dashboard only reads it, never changes its structure
 */
export type Contact = {
    readonly id: number;
    readonly createdAt: string | null;
    readonly fullname: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly userNote: string | null;
    readonly isContacted: boolean | null;
    readonly ourNote: string | null;
    readonly userAgent: string | null;
    readonly ipAddress: string | null;
    readonly referrer: string | null;
    readonly appName: string | null;
    readonly placeName: string | null;
    readonly url: string | null;
};

/**
 * Key of the contact field which is shown as one column of the contacts table
 *
 * Note: `id` is only a technical identifier, it is never shown as a column
 */
export type ContactColumnKey = Exclude<keyof Contact, 'id'>;

/**
 * Fields which may be filled in when a contact is added manually through the dashboard
 */
export const CONTACT_DRAFT_FIELD_NAMES = ['fullname', 'email', 'phone', 'userNote', 'appName', 'placeName'] as const;

/**
 * Name of one manually maintained contact field
 */
export type ContactDraftFieldName = (typeof CONTACT_DRAFT_FIELD_NAMES)[number];

/**
 * Values which can be filled in when a contact is added manually through the dashboard
 */
export type ContactDraft = Readonly<Record<ContactDraftFieldName, string>>;

/**
 * Empty contact draft used as the initial state of the "add contact" form
 */
export const EMPTY_CONTACT_DRAFT: ContactDraft = {
    fullname: '',
    email: '',
    phone: '',
    userNote: '',
    appName: '',
    placeName: '',
};

/**
 * Start an editable draft with the values of one existing contact
 */
export function createContactDraftFromContact(contact: Contact): ContactDraft {
    return {
        fullname: contact.fullname ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        userNote: contact.userNote ?? '',
        appName: contact.appName ?? '',
        placeName: contact.placeName ?? '',
    };
}

/**
 * Text fields which can be changed on an existing contact
 */
export const CONTACT_EDITABLE_TEXT_FIELD_NAMES = [...CONTACT_DRAFT_FIELD_NAMES, 'ourNote'] as const;

/**
 * Name of one editable text field of an existing contact
 */
export type ContactEditableTextFieldName = (typeof CONTACT_EDITABLE_TEXT_FIELD_NAMES)[number];

/**
 * Fields of an existing contact which can be changed from the dashboard
 */
export type ContactChanges = {
    readonly [fieldName in ContactEditableTextFieldName]?: string | null;
} & {
    readonly isContacted?: boolean;
};
