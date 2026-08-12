import type { Contact, NewContact } from '@/lib/contacts/Contact';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
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
