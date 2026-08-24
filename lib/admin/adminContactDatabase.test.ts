import type { Contact } from '@/lib/contacts/Contact';
import {
    WORKSHOP_FEEDBACK_TABLE_NAME,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadContactsMock } = vi.hoisted(() => ({
    loadContactsMock: vi.fn(),
}));

vi.mock('@/lib/contacts/contactsDatabase', () => ({
    CONTACT_TABLE_NAME: 'Contact',
    loadContacts: loadContactsMock,
}));

import { loadAdminJoinedContacts } from './adminContactDatabase';

const CONTACT: Contact = {
    id: 12,
    createdAt: '2026-08-10T10:00:00.000Z',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
    phone: null,
    userNote: null,
    isContacted: false,
    ourNote: null,
    userAgent: null,
    ipAddress: null,
    referrer: null,
    appName: null,
    placeName: null,
    url: null,
};

function createPagedQuery(rows: readonly Readonly<Record<string, unknown>>[]) {
    const range = vi.fn().mockResolvedValue({ data: rows, error: null });
    const query = {
        order: vi.fn(),
        range,
    };
    query.order.mockReturnValue(query);

    return {
        select: vi.fn(() => query),
        query,
    };
}

describe('loadAdminJoinedContacts', () => {
    beforeEach(() => {
        loadContactsMock.mockReset();
    });

    it('adds every activity total to the attendance from one shared multi-workshop query', async () => {
        const workshopQuery = createPagedQuery([
            {
                id: 'workshop-1',
                room_kind: 'workshop',
                title: 'Produkční kód s AI agenty',
                starts_at: '2026-08-20T17:00:00.000Z',
                ends_at: '2026-08-20T18:30:00.000Z',
            },
        ]);
        const participantQuery = createPagedQuery([
            {
                id: 'participant-1',
                workshop_id: 'workshop-1',
                fullname: 'Jana Nováková',
                email: 'JANA+workshop@EXAMPLE.COM',
                connected_at: '2026-08-20T16:55:00.000Z',
                last_seen_at: '2026-08-20T18:25:00.000Z',
                active_duration_seconds: 4_800,
                is_interaction_banned: false,
                is_trusted: true,
            },
        ]);
        const activityTotalsQuery = createPagedQuery([
            {
                workshop_id: 'workshop-1',
                participant_id: 'participant-1',
                comment_count: '2',
                reaction_count: '5',
                link_click_count: '1',
                upvote_count: '3',
            },
        ]);
        const feedbackQuery = createPagedQuery([
            {
                id: 'feedback-1',
                workshop_id: 'workshop-1',
                participant_id: 'participant-1',
                rating: 5,
                what_was_good: 'Ukázky v kódu.',
                what_was_bad: null,
                note: null,
                created_at: '2026-08-20T18:31:00.000Z',
                updated_at: '2026-08-20T18:31:00.000Z',
            },
        ]);
        const rpc = vi.fn(() => activityTotalsQuery.query);
        const from = vi.fn((tableName: string) => {
            if (tableName === WORKSHOP_TABLE_NAME) {
                return workshopQuery;
            }

            if (tableName === WORKSHOP_PARTICIPANT_TABLE_NAME) {
                return participantQuery;
            }

            if (tableName === WORKSHOP_FEEDBACK_TABLE_NAME) {
                return feedbackQuery;
            }

            return {};
        });
        const supabase = { from, rpc } as unknown as SupabaseClient;
        loadContactsMock.mockResolvedValue({ contacts: [CONTACT], errorMessage: null });

        const result = await loadAdminJoinedContacts(supabase);
        const workshopParticipation = result.contacts?.[0]?.contactGroup.workshopParticipations[0];
        const workshopFeedback = result.contacts?.[0]?.contactGroup.workshopFeedbacks[0];

        expect(result.errorMessage).toBeNull();
        expect(workshopParticipation).toMatchObject({
            activeDurationSeconds: 4_800,
            commentCount: 2,
            reactionCount: 5,
            linkClickCount: 1,
            upvoteCount: 3,
        });
        expect(rpc).toHaveBeenCalledWith('get_workshop_participant_activity_totals_for_workshops', {
            target_workshop_ids: ['workshop-1'],
        });
        expect(workshopFeedback).toMatchObject({
            rating: 5,
            whatWasGood: 'Ukázky v kódu.',
            workshopTitle: 'Produkční kód s AI agenty',
        });
    });
});
