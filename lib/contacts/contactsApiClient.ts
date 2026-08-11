import { buildAdminApiUrl } from '@/lib/admin/buildAdminApiUrl';
import { assertResponseIsOk } from '@/lib/api/assertResponseIsOk';
import type { Contact, ContactChanges, ContactDraft } from './Contact';

const CONTACTS_API_PATH = '/api/contacts';

/**
 * Build the url of the contacts api with the admin token and the optional additional parameters
 */
function buildContactsApiUrl(
    adminToken: string | null,
    additionalParams: Readonly<Record<string, string>> = {},
): string {
    return buildAdminApiUrl(CONTACTS_API_PATH, adminToken, additionalParams);
}

/**
 * Load every contact from the database
 *
 * Note: All the contacts are loaded at once and filtered in the browser, so that the exports match the shown table
 */
export async function fetchContacts(adminToken: string | null): Promise<Array<Contact>> {
    const response = await fetch(buildContactsApiUrl(adminToken, { showAll: 'true' }));
    await assertResponseIsOk(response);

    const payload = (await response.json()) as { contacts?: Array<Contact> | null };
    return payload.contacts || [];
}

/**
 * Add one manually filled in contact
 */
export async function createContact(adminToken: string | null, contactDraft: ContactDraft): Promise<Contact> {
    const response = await fetch(buildContactsApiUrl(adminToken), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactDraft),
    });
    await assertResponseIsOk(response);

    return (await response.json()) as Contact;
}

/**
 * Save the fields of one contact which we maintain ourselves
 */
export async function updateContact(
    adminToken: string | null,
    contactId: number,
    contactChanges: ContactChanges,
): Promise<void> {
    const response = await fetch(buildContactsApiUrl(adminToken), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contactId, ...contactChanges }),
    });
    await assertResponseIsOk(response);
}
