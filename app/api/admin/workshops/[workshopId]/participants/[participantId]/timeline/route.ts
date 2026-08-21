import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { loadWorkshopAdminParticipantTimeline } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopParticipantTimelineRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly participantId: string }>;
};

/**
 * Serves the full event history only after an administrator opens a participant's detail.
 */
export async function GET(request: NextRequest, context: AdminWorkshopParticipantTimelineRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, participantId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { timeline, errorMessage } = await loadWorkshopAdminParticipantTimeline(
        workshopData.supabase,
        workshopData.workshopRow,
        participantId,
    );
    if (timeline === null) {
        return errorMessage === null
            ? NextResponse.json({ error: 'Participant not found' }, { status: 404 })
            : NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json(timeline, { headers: { 'Cache-Control': 'no-store' } });
}
