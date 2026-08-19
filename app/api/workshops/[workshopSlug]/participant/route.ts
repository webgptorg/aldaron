import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { renameWorkshopParticipant } from '@/lib/workshops/workshopParticipantRename';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopParticipantRenameSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopParticipantRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

export async function PATCH(request: NextRequest, context: WorkshopParticipantRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopParticipantRenameSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Enter a valid name' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    // A banned participant keeps the name they were moderated under, because renaming would also rewrite the author
    // of the comments the room already sees.
    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    const renameResult = await renameWorkshopParticipant(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow.id,
        authenticatedRequest.participant.id,
        parsedResult.data.fullname,
    );
    if (renameResult === null) {
        return NextResponse.json({ error: 'Name could not be saved' }, { status: 500 });
    }

    // Nobody else needs a fresh snapshot when the new name stayed inside the room of the renamed participant.
    if (renameResult.isVisibleCommentRenamed) {
        await broadcastWorkshopEvent(authenticatedRequest.supabase, workshopSlug, { kind: 'state-changed' });
    }

    const response = NextResponse.json({ participant: renameResult.participant });
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
