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

    const supabase = createSupabaseClient();
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
    const supabase = createSupabaseClient();
    const { error } = await supabase.from('Contact').update({ ourNote, isContacted }).eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
