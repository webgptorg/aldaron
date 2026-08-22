import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { moderateWorkshopComment } from '@/lib/workshops/workshopCommentModeration';
import { getUnofferedWorkshopCommentModerationFieldNames } from '@/lib/workshops/workshopModeration';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getModeratingWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopCommentUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopCommentRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly commentId: string }>;
};

/**
 * Moderates one message straight from the room, so a moderator never leaves the chat they are moderating
 */
export async function PATCH(request: NextRequest, context: WorkshopCommentRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Změna komentáře není platná.' }, { status: 400 });
    }

    const { workshopSlug, commentId } = await context.params;
    const moderatingRequest = await getModeratingWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(moderatingRequest)) {
        return moderatingRequest;
    }

    const unofferedFieldNames = getUnofferedWorkshopCommentModerationFieldNames('moderator', parsedResult.data);
    if (unofferedFieldNames.length > 0) {
        return NextResponse.json(
            { error: `Moderátor nemůže měnit: ${unofferedFieldNames.join(', ')}.` },
            { status: 403 },
        );
    }

    const { comment, errorMessage } = await moderateWorkshopComment(
        moderatingRequest.supabase,
        moderatingRequest.workshopRow.id,
        commentId,
        parsedResult.data,
    );
    if (errorMessage !== null) {
        console.error('Failed to moderate a workshop comment from the room:', errorMessage);
        return NextResponse.json({ error: 'Komentář se nepodařilo změnit.' }, { status: 500 });
    }
    if (comment === null) {
        return NextResponse.json({ error: 'Komentář nebyl nalezen.' }, { status: 404 });
    }

    await broadcastWorkshopEvent(moderatingRequest.supabase, moderatingRequest.workshopRow, {
        kind: 'state-changed',
    });
    return NextResponse.json(comment, { headers: { 'Cache-Control': 'no-store' } });
}
