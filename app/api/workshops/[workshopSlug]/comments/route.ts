import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopCommentStatusForParticipant } from '@/lib/workshops/workshopParticipantInteraction';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopCommentSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

const COMMENT_RATE_LIMIT_ERROR = 'WORKSHOP_COMMENT_RATE_LIMITED';

type WorkshopCommentsRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

export async function POST(request: NextRequest, context: WorkshopCommentsRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Comment must contain 1 to 2,000 characters' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const commentStatus = getWorkshopCommentStatusForParticipant(authenticatedRequest.participant);

    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .insert({
            workshop_id: authenticatedRequest.workshopRow.id,
            participant_id: authenticatedRequest.participant.id,
            author_name: authenticatedRequest.participant.fullname,
            body: parsedResult.data.body,
            status: commentStatus,
        })
        .select('id, author_name, body, status, upvote_count, created_at')
        .single();

    if (error?.message.includes(COMMENT_RATE_LIMIT_ERROR)) {
        return NextResponse.json({ error: 'Please wait before sending another comment' }, { status: 429 });
    }
    if (error || data === null) {
        console.error('Failed to save a pending workshop comment:', error?.message ?? 'No comment returned');
        return NextResponse.json({ error: 'Comment could not be saved' }, { status: 500 });
    }

    const comment = {
        id: data.id,
        authorName: data.author_name,
        body: data.body,
        status: data.status,
        upvoteCount: data.upvote_count,
        isUpvotedByParticipant: false,
        createdAt: data.created_at,
    };

    if (commentStatus === 'approved') {
        await broadcastWorkshopEvent(authenticatedRequest.supabase, workshopSlug, { kind: 'state-changed' });
    }

    return NextResponse.json(
        {
            comment,
        },
        { status: 201 },
    );
}
