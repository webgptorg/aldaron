import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readWorkshopIdFromRequest } from '@/lib/workshop/servedWorkshop';
import { createWorkshopApiErrorResponse } from '@/lib/workshop/workshopApiErrorResponse';
import {
    createContentBlock,
    deleteContentBlock,
    fetchAllContentBlocks,
    updateContentBlock,
} from '@/lib/workshop/workshopContentBlocksRepository';
import { readContentBlockChanges, readContentBlockDraft } from '@/lib/workshop/workshopRequestBodies';
import { readRowId } from '@/lib/workshop/workshopValidation';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * The content of the workshop as the administration sees it, the drafts and the still locked blocks included
 *
 * Note: The participants never reach this endpoint, they only ever get the already unlocked blocks from
 *       `/api/workshop/state`.
 */
export async function GET(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const contentBlocks = await fetchAllContentBlocks(readWorkshopIdFromRequest(request));

        return NextResponse.json({ contentBlocks });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Add one content block
 */
export async function POST(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const body = (await request.json()) as Record<string, unknown>;

        const contentBlock = await createContentBlock(
            readWorkshopIdFromRequest(request),
            readContentBlockDraft(body),
        );

        return NextResponse.json({ contentBlock });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Change one content block, which is also how a block is unlocked or locked again
 */
export async function PATCH(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const body = (await request.json()) as Record<string, unknown>;

        const contentBlock = await updateContentBlock(readRowId(body.id), readContentBlockChanges(body));

        return NextResponse.json({ contentBlock });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Remove one content block, which takes it away from everybody who is connected
 */
export async function DELETE(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const body = (await request.json()) as Record<string, unknown>;

        await deleteContentBlock(readRowId(body.id));

        return NextResponse.json({ isDeleted: true });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}
