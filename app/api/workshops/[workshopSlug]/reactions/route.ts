import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_REACTION_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { mapWorkshopReactionRow } from '@/lib/workshops/workshopDatabase';
import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopReactionSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

const REACTION_RATE_LIMIT_ERROR = 'WORKSHOP_REACTION_RATE_LIMITED';

type WorkshopReactionsRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

export async function POST(request: NextRequest, context: WorkshopReactionsRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopReactionSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Unsupported reaction' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    if (!authenticatedRequest.workshopRow.allowed_reactions.includes(parsedResult.data.emoji)) {
        return NextResponse.json({ error: 'Unsupported reaction' }, { status: 400 });
    }

    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_REACTION_TABLE_NAME)
        .insert({
            workshop_id: authenticatedRequest.workshopRow.id,
            participant_id: authenticatedRequest.participant.id,
            emoji: parsedResult.data.emoji,
        })
        .select('id, emoji, created_at')
        .single();

    if (error?.message.includes(REACTION_RATE_LIMIT_ERROR)) {
        return NextResponse.json({ error: 'Too many reactions' }, { status: 429 });
    }
    if (error || data === null) {
        console.error('Failed to store a workshop reaction:', error?.message ?? 'No reaction returned');
        return NextResponse.json({ error: 'Reaction could not be saved' }, { status: 500 });
    }

    const reaction = mapWorkshopReactionRow(data);
    await broadcastWorkshopEvent(authenticatedRequest.supabase, workshopSlug, { kind: 'reaction', reaction });
    return NextResponse.json({ reaction }, { status: 201 });
}
