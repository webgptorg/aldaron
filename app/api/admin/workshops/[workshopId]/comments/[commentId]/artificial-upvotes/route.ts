import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getDisplayedWorkshopCommentUpvoteCount } from '@/lib/workshops/workshopCommentValues';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopCommentArtificialUpvoteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopArtificialUpvotesRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly commentId: string }>;
};

type ArtificialUpvoteAdjustmentRow = {
    readonly comment_id: string;
    readonly upvote_count: number;
    readonly artificial_upvote_count: number;
};

const ARTIFICIAL_UPVOTE_CONSTRAINT_ERROR_CODE = '23514';

export async function POST(request: NextRequest, context: AdminWorkshopArtificialUpvotesRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentArtificialUpvoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Artificial upvote adjustment must be a non-zero whole number' }, { status: 400 });
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase.rpc('adjust_workshop_comment_artificial_upvotes', {
        target_workshop_id: workshopId,
        target_comment_id: commentId,
        artificial_upvote_adjustment: parsedResult.data.artificialUpvoteAdjustment,
    });
    if (error) {
        const status = error.code === ARTIFICIAL_UPVOTE_CONSTRAINT_ERROR_CODE ? 400 : 500;
        const errorMessage =
            status === 400 ? 'Artificial upvote adjustment is outside the supported range' : 'Artificial upvotes could not be changed';
        if (status === 500) {
            console.error('Failed to adjust artificial workshop upvotes:', error.message);
        }
        return NextResponse.json({ error: errorMessage }, { status });
    }

    const updatedComment = ((data ?? []) as readonly ArtificialUpvoteAdjustmentRow[])[0] ?? null;
    if (updatedComment === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const upvoteCount = getDisplayedWorkshopCommentUpvoteCount(
        updatedComment.upvote_count,
        updatedComment.artificial_upvote_count,
    );
    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow.slug, {
        kind: 'upvote',
        commentId: updatedComment.comment_id,
        upvoteCount,
    });
    return NextResponse.json({
        commentId: updatedComment.comment_id,
        upvoteCount,
        artificialUpvoteCount: updatedComment.artificial_upvote_count,
    });
}
