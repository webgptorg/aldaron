import type { WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    getAdminWorkshopDataOrResponseMock,
    loadWorkshopCommentReferenceMock,
    updateWorkshopStageCommentMock,
    broadcastWorkshopEventMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    loadWorkshopCommentReferenceMock: vi.fn(),
    updateWorkshopStageCommentMock: vi.fn(),
    broadcastWorkshopEventMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({
    getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    loadWorkshopCommentReference: loadWorkshopCommentReferenceMock,
    updateWorkshopStageComment: updateWorkshopStageCommentMock,
}));
vi.mock('@/lib/workshops/workshopRealtime', () => ({
    broadcastWorkshopEvent: broadcastWorkshopEventMock,
}));

import { POST } from './route';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const COMMENT_ID = '496eb667-8f66-4e21-8245-494a6c35d8e8';
const SUPABASE = {};
const STAGE_COMMENT: WorkshopCommentReference = {
    id: COMMENT_ID,
    authorName: 'Jana Nováková',
    body: 'Jak poznám, že agent opravdu běží v produkci?',
};
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopId: WORKSHOP_ID }) };

function createRequest(commentId: string | null): NextRequest {
    return new NextRequest(`https://promptbook.studio/api/admin/workshops/${WORKSHOP_ID}/stage-comment`, {
        method: 'POST',
        body: JSON.stringify({ commentId }),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('admin workshop stage comment', () => {
    beforeEach(() => {
        getUnauthorizedResponseOrNullMock.mockReset();
        getAdminWorkshopDataOrResponseMock.mockReset();
        loadWorkshopCommentReferenceMock.mockReset();
        updateWorkshopStageCommentMock.mockReset();
        broadcastWorkshopEventMock.mockReset();

        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({
            supabase: SUPABASE,
            workshopRow: { room_kind: 'workshop', slug: 'online-workshop-2026-08-20' },
        });
        updateWorkshopStageCommentMock.mockResolvedValue({ errorMessage: null });
    });

    it('selects an attendee question, persists it, and broadcasts the same question to the stage', async () => {
        loadWorkshopCommentReferenceMock.mockResolvedValue({ comment: STAGE_COMMENT, errorMessage: null });

        const response = await POST(createRequest(COMMENT_ID), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ stageComment: STAGE_COMMENT });
        expect(loadWorkshopCommentReferenceMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ID, COMMENT_ID);
        expect(updateWorkshopStageCommentMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ID, COMMENT_ID);
        expect(broadcastWorkshopEventMock).toHaveBeenCalledWith(
            SUPABASE,
            { room_kind: 'workshop', slug: 'online-workshop-2026-08-20' },
            { kind: 'stage-comment', stageComment: STAGE_COMMENT },
        );
    });

    it('clears the stage without looking up an already absent comment', async () => {
        const response = await POST(createRequest(null), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ stageComment: null });
        expect(loadWorkshopCommentReferenceMock).not.toHaveBeenCalled();
        expect(updateWorkshopStageCommentMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ID, null);
        expect(broadcastWorkshopEventMock).toHaveBeenCalledWith(
            SUPABASE,
            { room_kind: 'workshop', slug: 'online-workshop-2026-08-20' },
            { kind: 'stage-comment', stageComment: null },
        );
    });

    it('refuses an unauthenticated request before it can select a question', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await POST(createRequest(COMMENT_ID), ROUTE_CONTEXT);

        expect(response.status).toBe(401);
        expect(getAdminWorkshopDataOrResponseMock).not.toHaveBeenCalled();
        expect(updateWorkshopStageCommentMock).not.toHaveBeenCalled();
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });
});
