import type { Contact, NewContact } from '@/lib/contacts/Contact';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Name of the table which holds the gathered contacts
 */
export const CONTACT_TABLE_NAME = 'Contact';

/**
 * What is answered when the contacts cannot be reached at all
 *
 * Note: It says nothing about the key which is missing, that belongs into the log of the server and not into an answer
 *       which anybody can ask for.
 */
const CONTACTS_UNREACHABLE_ERROR_MESSAGE = 'Database not configured';

/**
 * The `Contact` table, ready to be asked or changed
 */
export type ContactsTable = ReturnType<SupabaseClient['from']>;

/**
 * Reach the contacts, or `null` when this server cannot reach them at all
 *
 * Note: Row level security lets nobody but the service role touch the `Contact` table, see
 *       `lib/contacts/contact-table-rls.sql`. This is therefore the one and only way into the gathered contacts, so
 *       that the rule which key opens them is written down exactly once.
 */
export function getContactsTableOrNull(): ContactsTable | null {
    const supabase = createSupabaseServiceRoleClient();

    return supabase === null ? null : supabase.from(CONTACT_TABLE_NAME);
}

/**
 * Answer of an endpoint which cannot reach the contacts
 */
export function createContactsUnreachableResponse(): NextResponse {
    console.error(
        `⚠️ The contacts cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "${CONTACT_TABLE_NAME}" table is closed by row level security`,
    );

    return NextResponse.json({ error: CONTACTS_UNREACHABLE_ERROR_MESSAGE }, { status: 503 });
}

/**
 * Column which says when the contact was gathered, by which the contacts arrive from the database
 */
const CONTACT_CREATED_AT_COLUMN = 'createdAt';

/**
 * Unique stable ordering tie-breaker for contacts with the same creation timestamp.
 */
const CONTACT_ID_COLUMN = 'id';

/**
 * Column which says whether we have already answered the contact
 */
const CONTACT_IS_CONTACTED_COLUMN = 'isContacted';

/**
 * The read contacts, or the reason why they could not be read
 */
export type LoadedContacts = {
    readonly contacts: readonly Contact[] | null;
    readonly errorMessage: string | null;
};

type LoadContactsOptions = {
    /**
     * Read every contact, and not only the leads which nobody has answered yet
     */
    readonly isLoadingAll: boolean;
};

/**
 * Read the gathered contacts, the newest ones first
 *
 * Note: This is the one place which says in which order the contacts arrive, so that the dashboard and every export
 *       start from the very same list
 */
function createContactsQuery(contactsTable: ContactsTable, options: LoadContactsOptions) {
    const contactsQuery = contactsTable
        .select('*')
        .order(CONTACT_CREATED_AT_COLUMN, { ascending: false })
        .order(CONTACT_ID_COLUMN, { ascending: false });

    if (!options.isLoadingAll) {
        return contactsQuery.eq(CONTACT_IS_CONTACTED_COLUMN, false);
    }

    return contactsQuery;
}

/**
 * Read the gathered contacts, the newest first.
 *
 * Note: Every page uses the same deterministic order, so an admin join or export never silently loses contacts past
 *       the database response cap.
 */
export async function loadContacts(
    contactsTable: ContactsTable,
    options: LoadContactsOptions,
): Promise<LoadedContacts> {
    const { rows, errorMessage } = await loadAllSupabaseRows<Contact>((fromIndex, toIndex) =>
        createContactsQuery(contactsTable, options).range(fromIndex, toIndex),
    );

    if (rows === null) {
        return { contacts: null, errorMessage };
    }

    return { contacts: rows, errorMessage: null };
}

/**
 * One contact which was written into the database, or the reason why it was not
 */
export type InsertedContact = {
    readonly contact: Contact | null;
    readonly errorMessage: string | null;
};

/**
 * Write one freshly gathered contact into the database and read it back
 *
 * Note: Whoever gathers a contact, it always starts as not contacted, so that it waits in the dashboard among the
 *       leads which nobody has answered yet.
 */
export async function insertContact(contactsTable: ContactsTable, newContact: NewContact): Promise<InsertedContact> {
    const { data, error } = await contactsTable
        .insert({ ...newContact, isContacted: false })
        .select()
        .single();

    if (error) {
        return { contact: null, errorMessage: error.message };
    }

    return { contact: data as Contact, errorMessage: null };
}
