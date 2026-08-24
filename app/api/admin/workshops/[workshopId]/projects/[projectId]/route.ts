import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_PROJECT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopProjectModerationSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopProjectRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly projectId: string }>;
};

/**
 * Makes the moderation decision on one member project. The administration owns this decision; a project author cannot
 * turn their own waiting post into a public one by forging a status in their submission request.
 */
export async function PATCH(request: NextRequest, context: AdminWorkshopProjectRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopProjectModerationSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'A project can only be approved or rejected' }, { status: 400 });
    }

    const { workshopId, projectId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isProjectSharingOffered) {
        return NextResponse.json({ error: 'Project sharing is not available in this room' }, { status: 404 });
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_PROJECT_TABLE_NAME)
        .update({ status: parsedResult.data.status })
        .eq('id', projectId)
        .eq('workshop_id', workshopData.workshopRow.id)
        .select('id, status')
        .maybeSingle();
    if (error) {
        console.error('Failed to moderate a community project:', error.message);
        return NextResponse.json({ error: 'Project could not be moderated' }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ projectId: data.id, status: data.status }, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Removes a project entirely, for example when it is spam or its original material must no longer be retained.
 */
export async function DELETE(request: NextRequest, context: AdminWorkshopProjectRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, projectId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isProjectSharingOffered) {
        return NextResponse.json({ error: 'Project sharing is not available in this room' }, { status: 404 });
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_PROJECT_TABLE_NAME)
        .delete()
        .eq('id', projectId)
        .eq('workshop_id', workshopData.workshopRow.id)
        .select('id')
        .maybeSingle();
    if (error) {
        console.error('Failed to delete a community project:', error.message);
        return NextResponse.json({ error: 'Project could not be deleted' }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ projectId: data.id }, { headers: { 'Cache-Control': 'no-store' } });
}
