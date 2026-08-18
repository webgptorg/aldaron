import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_REACTION_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { mapWorkshopReactionRow } from '@/lib/workshops/workshopDatabase';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopArtificialReactionSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopArtificialReactionDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopArtificialReactionsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function POST(request: NextRequest, context: AdminWorkshopArtificialReactionsRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopArtificialReactionSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Artificial reaction must contain 1 to 16 characters' }, { status: 400 });
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_REACTION_TABLE_NAME)
        .insert({
            workshop_id: workshopId,
            ...createWorkshopArtificialReactionDatabaseValues(parsedResult.data),
        })
        .select('id, emoji, created_at')
        .single();
    if (error || data === null) {
        console.error('Failed to send an artificial workshop reaction:', error?.message ?? 'No reaction returned');
        return NextResponse.json({ error: 'Artificial reaction could not be sent' }, { status: 500 });
    }

    const reaction = mapWorkshopReactionRow(data);
    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow.slug, { kind: 'reaction', reaction });
    return NextResponse.json({ reaction }, { status: 201 });
}
