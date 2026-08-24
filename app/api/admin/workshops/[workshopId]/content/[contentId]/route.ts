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
import { workshopContentUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopContentUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopContentItemRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly contentId: string }>;
};

async function getWorkshopOrResponse(workshopId: string) {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return { response: createWorkshopDatabaseUnavailableResponse() } as const;
    }

    const workshopRow = await findWorkshopById(supabase, workshopId);
    return workshopRow === null
        ? ({ response: NextResponse.json({ error: 'Workshop not found' }, { status: 404 }) } as const)
        : ({ supabase, workshopRow } as const);
}

export async function PATCH(request: NextRequest, context: AdminWorkshopContentItemRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopContentUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid content' },
            { status: 400 },
        );
    }

    const { workshopId, contentId } = await context.params;
    const workshopResult = await getWorkshopOrResponse(workshopId);
    if ('response' in workshopResult) {
        return workshopResult.response;
    }

    const { data, error } = await workshopResult.supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .update(createWorkshopContentUpdateDatabaseValues(parsedResult.data))
        .eq('id', contentId)
        .eq('workshop_id', workshopId)
        .select('id, title, body_markdown, unlock_at, sort_order, is_published, is_follow_up, created_at, updated_at')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Content block not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopResult.supabase, workshopResult.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ contentBlock: mapWorkshopContentRow(data) });
}

export async function DELETE(request: NextRequest, context: AdminWorkshopContentItemRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, contentId } = await context.params;
    const workshopResult = await getWorkshopOrResponse(workshopId);
    if ('response' in workshopResult) {
        return workshopResult.response;
    }

    const { data, error } = await workshopResult.supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .delete()
        .eq('id', contentId)
        .eq('workshop_id', workshopId)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Content block not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopResult.supabase, workshopResult.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ success: true });
}
