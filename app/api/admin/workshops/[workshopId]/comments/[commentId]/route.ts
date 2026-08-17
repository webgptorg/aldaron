import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopById,
    getWorkshopDatabaseOrNull,
} from '@/lib/workshops/workshopDatabase';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopCommentModerationSchema } from '@/lib/workshops/workshopSchemas';
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
    const parsedResult = workshopCommentModerationSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Comment status must be approved or rejected' }, { status: 400 });
    }

    const { workshopId, commentId } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopById(supabase, workshopId);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .update({ status: parsedResult.data.status, moderated_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select('id, status')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(supabase, workshopRow.slug, { kind: 'state-changed' });
    return NextResponse.json({ commentId: data.id, status: data.status });
}
