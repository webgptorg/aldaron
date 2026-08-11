// app/api/contacts/route.ts
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import {
    CONTACT_DRAFT_FIELD_NAMES,
    CONTACT_EDITABLE_TEXT_FIELD_NAMES,
    type ContactChanges,
    type ContactEditableTextFieldName,
} from '@/lib/contacts/Contact';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

type MutableContactChanges = {
    [fieldName in ContactEditableTextFieldName]?: string | null;
} & {
    isContacted?: boolean;
};

/**
 * Is the parsed JSON body an object which can contain a contact mutation
 */
function isContactRequestBody(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Read the JSON body without letting malformed requests reach a database query
 */
async function readContactRequestBody(request: NextRequest): Promise<Record<string, unknown> | null> {
    try {
        const body = await request.json();
        return isContactRequestBody(body) ? body : null;
    } catch {
        return null;
    }
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
    const contactChanges: MutableContactChanges = {};

    for (const fieldName of CONTACT_EDITABLE_TEXT_FIELD_NAMES) {
        const fieldValue = body[fieldName];
        if (fieldValue === undefined) {
            continue;
        }
        if (typeof fieldValue !== 'string') {
            return null;
        }

        contactChanges[fieldName] = fieldValue || null;
    }

    if (body.isContacted !== undefined) {
        if (typeof body.isContacted !== 'boolean') {
            return null;
        }

        contactChanges.isContacted = body.isContacted;
    }

    return contactChanges;
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const isShowingAll = url.searchParams.get('showAll') === 'true';

    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    let query = supabase.from('Contact').select('*').order('createdAt', { ascending: false });
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

    const body = await readContactRequestBody(request);
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

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const { data, error } = await supabase
        .from('Contact')
        .update(contactChanges)
        .eq('id', contactId)
        .limit(1)
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

    const body = await readContactRequestBody(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactChanges = readContactChanges(body);
    if (contactChanges === null) {
        return NextResponse.json({ error: 'Contact fields must be text or boolean values' }, { status: 400 });
    }

    const manualContactValues = Object.fromEntries(
        CONTACT_DRAFT_FIELD_NAMES.map((fieldName) => [fieldName, contactChanges[fieldName] ?? null]),
    );

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const { data, error } = await supabase
        .from('Contact')
        .insert({
            ...manualContactValues,
            isContacted: false,
            userAgent: 'Manual entry',
            ipAddress: null,
            referrer: null,
            url: null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

/**
 * Remove one contact. The filter and explicit limit protect every other contact even if the schema changes later.
 */
export async function DELETE(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readContactRequestBody(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactId = readContactId(body);
    if (contactId === null) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const { data, error } = await supabase
        .from('Contact')
        .delete()
        .eq('id', contactId)
        .limit(1)
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
