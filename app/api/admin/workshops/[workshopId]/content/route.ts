import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_CONTENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopById,
    getWorkshopDatabaseOrNull,
    mapWorkshopContentRow,
} from '@/lib/workshops/workshopDatabase';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopContentCreateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopContentDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopContentRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function POST(request: NextRequest, context: AdminWorkshopContentRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopContentCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid content' },
            { status: 400 },
        );
    }

    const { workshopId } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopById(supabase, workshopId);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const { data, error } = await supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .insert({ workshop_id: workshopId, ...createWorkshopContentDatabaseValues(parsedResult.data) })
        .select('id, title, body_markdown, unlock_at, sort_order, is_published, created_at, updated_at')
        .single();
    if (error || data === null) {
        return NextResponse.json({ error: error?.message ?? 'Content was not returned' }, { status: 500 });
    }

    await broadcastWorkshopEvent(supabase, workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ contentBlock: mapWorkshopContentRow(data) }, { status: 201 });
}
