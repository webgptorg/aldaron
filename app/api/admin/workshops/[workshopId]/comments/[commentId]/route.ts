import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopCommentUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopCommentUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopCommentRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly commentId: string }>;
};

export async function PATCH(request: NextRequest, context: AdminWorkshopCommentRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: 'Comment update must set a status or a text of 1 to 2,000 characters' },
            { status: 400 },
        );
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .update(createWorkshopCommentUpdateDatabaseValues(parsedResult.data))
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select('id, status, body')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow.slug, { kind: 'state-changed' });
    return NextResponse.json({ commentId: data.id, status: data.status, body: data.body });
}

export async function DELETE(request: NextRequest, context: AdminWorkshopCommentRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .delete()
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow.slug, { kind: 'state-changed' });
    return NextResponse.json({ commentId: data.id });
}
