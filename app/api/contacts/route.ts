// app/api/contacts/route.ts
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const showAll = url.searchParams.get('showAll') === 'true';

    const unauthorizedResponse = getUnauthorizedResponseOrNull(req);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    let query = supabase.from('Contact').select('*').order('createdAt', { ascending: false });
    if (!showAll) {
        query = query.eq('isContacted', false);
    }
    const { data, error } = await query;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ contacts: data });
}

export async function PATCH(req: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(req);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await req.json();
    const { id, ourNote, isContacted } = body as any;
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Note: Only the fields which are really sent are updated, so changing one of them never overwrites the other one
    const contactChanges: Record<string, unknown> = {};
    if (ourNote !== undefined) {
        contactChanges.ourNote = ourNote;
    }
    if (isContacted !== undefined) {
        contactChanges.isContacted = isContacted;
    }
    if (Object.keys(contactChanges).length === 0) {
        return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const { error } = await supabase.from('Contact').update(contactChanges).eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(req);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await req.json();
    const { fullname, email, phone, userNote, appName, placeName } = body as any;

    const supabase = createSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const { data, error } = await supabase
        .from('Contact')
        .insert({
            fullname: fullname || null,
            email: email || null,
            phone: phone || null,
            userNote: userNote || null,
            appName: appName || null,
            placeName: placeName || null,
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
