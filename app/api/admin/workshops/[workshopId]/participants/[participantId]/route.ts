import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopParticipantUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopParticipantRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly participantId: string }>;
};

export async function PATCH(request: NextRequest, context: AdminWorkshopParticipantRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopParticipantUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Participant update is invalid' }, { status: 400 });
    }

    const { workshopId, participantId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update({
            ...(parsedResult.data.isInteractionBanned === undefined
                ? {}
                : { is_interaction_banned: parsedResult.data.isInteractionBanned }),
            ...(parsedResult.data.isTrusted === undefined ? {} : { is_trusted: parsedResult.data.isTrusted }),
        })
        .eq('id', participantId)
        .eq('workshop_id', workshopId)
        .select('id, is_interaction_banned, is_trusted')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({
        participantId: data.id,
        isInteractionBanned: data.is_interaction_banned,
        isTrusted: data.is_trusted,
    });
}

export async function DELETE(request: NextRequest, context: AdminWorkshopParticipantRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, participantId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .delete()
        .eq('id', participantId)
        .eq('workshop_id', workshopId)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ participantId: data.id });
}
