import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { getDisplayedWorkshopCommentUpvoteCount } from '@/lib/workshops/workshopCommentValues';
import { WORKSHOP_COMMENT_TABLE_NAME, WORKSHOP_UPVOTE_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopUpvoteRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly commentId: string }>;
};

export async function POST(request: NextRequest, context: WorkshopUpvoteRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const { workshopSlug, commentId } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    const { data: comment, error: commentError } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, upvote_count')
        .eq('id', commentId)
        .eq('workshop_id', authenticatedRequest.workshopRow.id)
        .eq('status', 'approved')
        .maybeSingle();

    if (commentError) {
        return NextResponse.json({ error: 'Comment could not be checked' }, { status: 500 });
    }
    if (comment === null) {
        return NextResponse.json({ error: 'Approved comment not found' }, { status: 404 });
    }

    const { error: upvoteError } = await authenticatedRequest.supabase.from(WORKSHOP_UPVOTE_TABLE_NAME).insert({
        workshop_id: authenticatedRequest.workshopRow.id,
        comment_id: commentId,
        participant_id: authenticatedRequest.participant.id,
    });

    if (upvoteError && upvoteError.code !== '23505') {
        console.error('Failed to store a workshop upvote:', upvoteError.message);
        return NextResponse.json({ error: 'Upvote could not be saved' }, { status: 500 });
    }

    const { data: updatedComment, error: updatedCommentError } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('upvote_count, artificial_upvote_count')
        .eq('id', commentId)
        .eq('workshop_id', authenticatedRequest.workshopRow.id)
        .single();

    if (updatedCommentError || updatedComment === null) {
        return NextResponse.json({ error: 'Upvote total could not be loaded' }, { status: 500 });
    }

    const upvoteCount = getDisplayedWorkshopCommentUpvoteCount(
        updatedComment.upvote_count as number,
        updatedComment.artificial_upvote_count as number,
    );
    if (!upvoteError) {
        await broadcastWorkshopEvent(authenticatedRequest.supabase, workshopSlug, {
            kind: 'upvote',
            commentId,
            upvoteCount,
        });
    }

    return NextResponse.json({ commentId, upvoteCount, isUpvotedByParticipant: true });
}
