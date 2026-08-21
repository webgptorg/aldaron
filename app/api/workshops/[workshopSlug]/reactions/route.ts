import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { createWorkshopReaction } from '@/lib/workshops/workshopDatabase';
import {
    getDisabledWorkshopPanelResponseOrNull,
    getWorkshopInteractionBanResponseOrNull,
} from '@/lib/workshops/workshopParticipantInteraction';
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

    const disabledReactionsResponse = getDisabledWorkshopPanelResponseOrNull(
        authenticatedRequest.workshopRow,
        'reactions',
    );
    if (disabledReactionsResponse) {
        return disabledReactionsResponse;
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    if (!authenticatedRequest.workshopRow.allowed_reactions.includes(parsedResult.data.emoji)) {
        return NextResponse.json({ error: 'Unsupported reaction' }, { status: 400 });
    }

    const createdReaction = await createWorkshopReaction(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow.id,
        authenticatedRequest.participant.id,
        parsedResult.data.emoji,
    );
    if (createdReaction.reaction === null) {
        if (createdReaction.errorMessage.includes(REACTION_RATE_LIMIT_ERROR)) {
            return NextResponse.json({ error: 'Too many reactions' }, { status: 429 });
        }

        console.error('Failed to store a workshop reaction:', createdReaction.errorMessage);
        return NextResponse.json({ error: 'Reaction could not be saved' }, { status: 500 });
    }

    await broadcastWorkshopEvent(authenticatedRequest.supabase, workshopSlug, {
        kind: 'reaction',
        reaction: createdReaction.reaction,
        reactionCount: createdReaction.reactionCount,
    });
    return NextResponse.json(
        { reaction: createdReaction.reaction, reactionCount: createdReaction.reactionCount },
        { status: 201 },
    );
}
