// app/api/contacts/route.ts
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    CONTACT_DRAFT_FIELD_NAMES,
    CONTACT_EDITABLE_TEXT_FIELD_NAMES,
    type ContactChanges,
} from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { readContactTextFields } from '@/lib/contacts/readContactTextFields';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Unique column by which one single contact is found and ordered
 */
const CONTACT_ID_COLUMN = 'id';

/**
 * How many contacts one mutation of the dashboard is ever allowed to touch
 */
const ONE_CONTACT_LIMIT = 1;

/**
 * What is written instead of a browser for a contact somebody typed into the dashboard by hand
 */
const MANUAL_CONTACT_USER_AGENT = 'Manual entry';

/**
 * A mutation which can still be narrowed down to one row, described only by the methods the narrowing needs
 */
type ScopableContactMutation<ScopedMutation> = {
    eq(
        column: string,
        value: number,
    ): {
        order(column: string): {
            limit(count: number): ScopedMutation;
        };
    };
};

/**
 * Narrow one mutation down to exactly the one requested contact, so that no other contact can ever be touched
 *
 * Note: PostgREST refuses a `limit` which has no explicit `order` ("A 'limit' was applied without an explicit 'order'"),
 *       therefore the rows are ordered by the unique id, which makes the limited mutation unambiguous
 */
function scopeMutationToOneContact<ScopedMutation>(
    mutation: ScopableContactMutation<ScopedMutation>,
    contactId: number,
): ScopedMutation {
    return mutation.eq(CONTACT_ID_COLUMN, contactId).order(CONTACT_ID_COLUMN).limit(ONE_CONTACT_LIMIT);
}

/**
 * Read a positive integer contact id from a request body
 */
function readContactId(body: Readonly<Record<string, unknown>>): number | null {
    const contactId = body.id;
    return typeof contactId === 'number' && Number.isSafeInteger(contactId) && contactId > 0 ? contactId : null;
}

/**
 * Read only the contact fields which the dashboard is allowed to change
 */
function readContactChanges(body: Readonly<Record<string, unknown>>): ContactChanges | null {
    const contactTextFields = readContactTextFields(body, CONTACT_EDITABLE_TEXT_FIELD_NAMES);
    if (contactTextFields === null) {
        return null;
    }

    if (body.isContacted === undefined) {
        return contactTextFields;
    }
    if (typeof body.isContacted !== 'boolean') {
        return null;
    }

    return { ...contactTextFields, isContacted: body.isContacted };
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const isShowingAll = url.searchParams.get('showAll') === 'true';

    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    let query = contactsTable.select('*').order('createdAt', { ascending: false });
    if (!isShowingAll) {
        query = query.eq('isContacted', false);
    }
    const { data, error } = await query;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ contacts: data });
}

export async function PATCH(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactId = readContactId(body);
    if (contactId === null) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Note: Only the fields which are really sent are updated, so changing one of them never overwrites the other one.
    const contactChanges = readContactChanges(body);
    if (contactChanges === null) {
        return NextResponse.json({ error: 'Contact fields must be text or boolean values' }, { status: 400 });
    }
    if (Object.keys(contactChanges).length === 0) {
        return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { data, error } = await scopeMutationToOneContact(contactsTable.update(contactChanges), contactId)
        .select()
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactDraft = readContactTextFields(body, CONTACT_DRAFT_FIELD_NAMES);
    if (contactDraft === null) {
        return NextResponse.json({ error: 'Contact fields must be text values' }, { status: 400 });
    }

    const manualContactValues = Object.fromEntries(
        CONTACT_DRAFT_FIELD_NAMES.map((fieldName) => [fieldName, contactDraft[fieldName] ?? null]),
    );

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { contact, errorMessage } = await insertContact(contactsTable, {
        ...manualContactValues,
        userAgent: MANUAL_CONTACT_USER_AGENT,
        ipAddress: null,
        referrer: null,
        url: null,
    });

    if (errorMessage !== null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    return NextResponse.json(contact);
}

/**
 * Remove one contact. The filter and explicit limit protect every other contact even if the schema changes later.
 */
export async function DELETE(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactId = readContactId(body);
    if (contactId === null) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { data, error } = await scopeMutationToOneContact(contactsTable.delete(), contactId)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}
