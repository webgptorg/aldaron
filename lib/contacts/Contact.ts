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
 * Values which can be filled in when a contact is added manually through the dashboard
 */
export type ContactDraft = {
    readonly fullname: string;
    readonly email: string;
    readonly phone: string;
    readonly userNote: string;
    readonly appName: string;
    readonly placeName: string;
};

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
 * Fields of an existing contact which can be changed from the dashboard
 */
export type ContactChanges = {
    readonly isContacted?: boolean;
    readonly ourNote?: string;
};
