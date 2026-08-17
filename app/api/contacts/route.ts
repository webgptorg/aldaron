// app/api/contacts/route.ts
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const showAll = url.searchParams.get('showAll') === 'true';

    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

export async function PATCH(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { id, ourNote, isContacted } = body as any;
    if (!id) {
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

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { fullname, email, phone, userNote, appName, placeName } = body as any;

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
