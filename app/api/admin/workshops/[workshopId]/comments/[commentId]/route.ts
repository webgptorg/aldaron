import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { updatePinnedWorkshopComment } from '@/lib/workshops/workshopDatabase';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopCommentUpdateSchema } from '@/lib/workshops/workshopSchemas';
import {
    createWorkshopCommentUpdateDatabaseValues,
    getWorkshopCommentPinChange,
} from '@/lib/workshops/workshopValues';
import type { WorkshopCommentStatus } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopCommentRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly commentId: string }>;
};

type ModeratedWorkshopCommentRow = {
    readonly id: string;
    readonly status: WorkshopCommentStatus;
    readonly body: string;
};

type LoadedModeratedWorkshopComment = {
    readonly data: ModeratedWorkshopCommentRow | null;
    readonly error: { readonly message: string } | null;
};

const MODERATED_WORKSHOP_COMMENT_COLUMNS = 'id, status, body';

/**
 * Writes the changed fields of a comment and reads it back, or only reads it when nothing but its pin changes
 *
 * Note: Reading the comment back proves that it belongs to this very workshop before its pin is moved.
 */
async function loadModeratedWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    commentDatabaseValues: Readonly<Record<string, unknown>>,
): Promise<LoadedModeratedWorkshopComment> {
    const commentTable = supabase.from(WORKSHOP_COMMENT_TABLE_NAME);

    if (Object.keys(commentDatabaseValues).length === 0) {
        return await commentTable
            .select(MODERATED_WORKSHOP_COMMENT_COLUMNS)
            .eq('id', commentId)
            .eq('workshop_id', workshopId)
            .maybeSingle();
    }

    return await commentTable
        .update(commentDatabaseValues)
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select(MODERATED_WORKSHOP_COMMENT_COLUMNS)
        .maybeSingle();
}

export async function PATCH(request: NextRequest, context: AdminWorkshopCommentRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: 'Comment update must set a status, a text of 1 to 2,000 characters, or the pin' },
            { status: 400 },
        );
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await loadModeratedWorkshopComment(
        workshopData.supabase,
        workshopId,
        commentId,
        createWorkshopCommentUpdateDatabaseValues(parsedResult.data),
    );
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const pinChange = getWorkshopCommentPinChange(parsedResult.data);
    if (pinChange !== null) {
        const { errorMessage } = await updatePinnedWorkshopComment(
            workshopData.supabase,
            workshopId,
            commentId,
            pinChange,
        );
        if (errorMessage !== null) {
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ commentId: data.id, status: data.status, body: data.body });
}

export async function DELETE(request: NextRequest, context: AdminWorkshopCommentRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .delete()
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ commentId: data.id });
}
