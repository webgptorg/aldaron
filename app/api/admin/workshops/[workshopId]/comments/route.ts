import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopArtificialCommentSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopArtificialCommentDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopCommentsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function POST(request: NextRequest, context: AdminWorkshopCommentsRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopArtificialCommentSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: 'Artificial comment must contain an author name and 1 to 2,000 characters' },
            { status: 400 },
        );
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data, error } = await workshopData.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .insert({
            workshop_id: workshopId,
            ...createWorkshopArtificialCommentDatabaseValues(parsedResult.data),
        })
        .select('id')
        .single();
    if (error || data === null) {
        console.error('Failed to create an artificial workshop comment:', error?.message ?? 'No comment returned');
        return NextResponse.json({ error: 'Artificial comment could not be created' }, { status: 500 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ commentId: data.id }, { status: 201 });
}
