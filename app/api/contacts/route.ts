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
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const { error } = await supabase.from('Contact').update({ ourNote, isContacted }).eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
