import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { loadWorkshopAdminParticipantPage } from '@/lib/workshops/workshopDatabase';
import { parseWorkshopAdminParticipantQuery } from '@/lib/workshops/workshopAdminParticipantQuery';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopParticipantsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/**
 * Serves one filtered and sorted page instead of the entire audience of a workshop.
 */
export async function GET(request: NextRequest, context: AdminWorkshopParticipantsRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const query = parseWorkshopAdminParticipantQuery(request.nextUrl.searchParams);
    const { page, errorMessage } = await loadWorkshopAdminParticipantPage(workshopData.supabase, workshopId, query);
    if (page === null) {
        return NextResponse.json({ error: errorMessage ?? 'Participants could not be loaded' }, { status: 500 });
    }

    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } });
}
