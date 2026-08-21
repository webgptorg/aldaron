import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopDatabaseUnavailableResponse,
    getWorkshopDatabaseOrNull,
    mapWorkshopRow,
    mapWorkshopSummaryRow,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { workshopCreateSchema } from '@/lib/workshops/workshopSchemas';
import { isWorkshopKind, type WorkshopKind } from '@/lib/workshops/workshopTypes';
import { createWorkshopDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const requestedWorkshopKind = request.nextUrl.searchParams.get('kind');
    if (requestedWorkshopKind !== null && !isWorkshopKind(requestedWorkshopKind)) {
        return NextResponse.json({ error: 'Invalid workshop kind' }, { status: 400 });
    }
    const workshopKind: WorkshopKind = requestedWorkshopKind ?? 'workshop';

    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select('*')
        .eq('room_kind', workshopKind)
        .order('starts_at', { ascending: false });
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        { workshops: ((data ?? []) as WorkshopRow[]).map(mapWorkshopSummaryRow) },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}

export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid workshop' },
            { status: 400 },
        );
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .insert(createWorkshopDatabaseValues(parsedResult.data))
        .select('*')
        .single();
    if (error) {
        const status = error.code === '23505' ? 409 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ workshop: mapWorkshopRow(data as WorkshopRow) }, { status: 201 });
}
