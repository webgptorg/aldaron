import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { countWatchingWorkshopParticipants } from '@/lib/workshops/workshopDatabase';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopPresenceSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopPresenceRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

export async function POST(request: NextRequest, context: WorkshopPresenceRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPresenceSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Active duration is invalid' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { error } = await authenticatedRequest.supabase.rpc('record_workshop_participant_presence', {
        target_workshop_id: authenticatedRequest.workshopRow.id,
        target_participant_id: authenticatedRequest.participant.id,
        reported_active_duration_seconds: parsedResult.data.activeDurationSeconds,
    });
    if (error) {
        console.error('Failed to record workshop participant presence:', error.message);
        return NextResponse.json({ error: 'Active duration could not be saved' }, { status: 500 });
    }

    // Answering the heartbeat with the live audience keeps the count fresh without a poll of its own.
    const watchingParticipantCount = await countWatchingWorkshopParticipants(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow.id,
    );

    return NextResponse.json({ watchingParticipantCount }, { headers: { 'Cache-Control': 'no-store' } });
}
