import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_POLL_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopPollCloseSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopPollRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly pollId: string }>;
};

/**
 * A poll can only move from open to closed. Its stored aggregate result stays in the community, while the database
 * trigger refuses any last-moment changed vote.
 */
export async function PATCH(request: NextRequest, context: AdminWorkshopPollRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollCloseSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'A poll can only be closed' }, { status: 400 });
    }

    const { workshopId, pollId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const { data: poll, error } = await workshopData.supabase
        .from(WORKSHOP_POLL_TABLE_NAME)
        .update({ is_closed: true })
        .eq('id', pollId)
        .eq('workshop_id', workshopData.workshopRow.id)
        .select('id')
        .maybeSingle();
    if (error) {
        console.error('Failed to close a community poll:', error.message);
        return NextResponse.json({ error: 'Poll could not be closed' }, { status: 500 });
    }
    if (poll === null) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId });
}
