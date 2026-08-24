import type { WorkshopAdminFeedback } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    getAdminWorkshopDataOrResponseMock,
    loadWorkshopAdminFeedbackMock,
    loadAdminContactGroupsMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    loadWorkshopAdminFeedbackMock: vi.fn(),
    loadAdminContactGroupsMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({
    getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    loadWorkshopAdminFeedback: loadWorkshopAdminFeedbackMock,
}));
vi.mock('@/lib/admin/adminContactDatabase', () => ({
    loadAdminContactGroups: loadAdminContactGroupsMock,
}));

import { GET } from './route';

const FEEDBACK: WorkshopAdminFeedback = {
    id: 'feedback-1',
    participantId: 'participant-1',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
    rating: 5,
    whatWasGood: 'Ukázky.',
    whatWasBad: null,
    note: null,
    createdAt: '2026-08-20T18:31:00.000Z',
    updatedAt: '2026-08-20T18:31:00.000Z',
};

function createRequest(): NextRequest {
    return new NextRequest('https://promptbook.studio/api/admin/workshops/workshop-1/feedback');
}

const routeContext = { params: Promise.resolve({ workshopId: 'workshop-1' }) };

describe('admin workshop feedback', () => {
    beforeEach(() => {
        getUnauthorizedResponseOrNullMock.mockReset();
        getAdminWorkshopDataOrResponseMock.mockReset();
        loadWorkshopAdminFeedbackMock.mockReset();
        loadAdminContactGroupsMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
    });

    it('refuses an unauthenticated request before it reaches feedback or contact data', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await GET(createRequest(), routeContext);

        expect(response.status).toBe(401);
        expect(getAdminWorkshopDataOrResponseMock).not.toHaveBeenCalled();
        expect(loadWorkshopAdminFeedbackMock).not.toHaveBeenCalled();
    });

    it('returns the feedback only to an administrator together with its joined contact context', async () => {
        const supabase = {};
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({
            supabase,
            workshopRow: { room_kind: 'workshop' },
        });
        loadWorkshopAdminFeedbackMock.mockResolvedValue({ feedbacks: [FEEDBACK], errorMessage: null });
        loadAdminContactGroupsMock.mockResolvedValue({
            groups: [
                {
                    normalizedEmail: 'jana@example.com',
                    contacts: [],
                    workshopParticipations: [],
                    workshopFeedbacks: [],
                },
            ],
            errorMessage: null,
        });

        const response = await GET(createRequest(), routeContext);

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
            feedbacks: [{ ...FEEDBACK, contactGroup: { normalizedEmail: 'jana@example.com' } }],
        });
        expect(loadWorkshopAdminFeedbackMock).toHaveBeenCalledWith(supabase, 'workshop-1');
        expect(loadAdminContactGroupsMock).toHaveBeenCalledWith(supabase, {
            isLoadingAll: true,
            isWorkshopParticipationsIncluded: false,
        });
    });
});
