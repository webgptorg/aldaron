import {
    DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY,
    parseWorkshopAdminParticipantQuery,
    serializeWorkshopAdminParticipantQuery,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import { describe, expect, it } from 'vitest';

describe('workshop admin participant query', () => {
    it('reads every supported filter, sort, and page value from the administration URL', () => {
        const query = parseWorkshopAdminParticipantQuery(
            new URLSearchParams({
                search: '  Jana Nováková  ',
                trusted: 'TRUE',
                interactionBanned: 'false',
                registeredFrom: '2026-08-20T17:00:00.000Z',
                registeredTo: '2026-08-20T18:30:00.000Z',
                sortBy: 'reactionCount',
                sortDirection: 'ascending',
                page: '3',
                pageSize: '100',
            }),
        );

        expect(query).toEqual({
            searchQuery: 'Jana Nováková',
            isTrusted: true,
            isInteractionBanned: false,
            registeredFrom: '2026-08-20T17:00:00.000Z',
            registeredTo: '2026-08-20T18:30:00.000Z',
            sortBy: 'reactionCount',
            sortDirection: 'ASCENDING',
            page: 3,
            pageSize: 100,
        });
    });

    it('uses bounded defaults for invalid values so the database only receives a safe query', () => {
        const query = parseWorkshopAdminParticipantQuery(
            new URLSearchParams({
                trusted: 'maybe',
                interactionBanned: 'yes',
                registeredFrom: 'not-a-date',
                sortBy: 'DROP TABLE',
                sortDirection: 'sideways',
                page: '0',
                pageSize: '100000',
            }),
        );

        expect(query).toEqual(DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY);
    });

    it('keeps the export filter and sort but removes empty filters from a pre-existing URL', () => {
        const searchParams = serializeWorkshopAdminParticipantQuery(
            {
                ...DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY,
                sortBy: 'fullname',
                sortDirection: 'ASCENDING',
                page: 2,
                pageSize: 200,
            },
            new URLSearchParams({ token: 'secret', search: 'old', trusted: 'true' }),
        );

        expect(searchParams.get('token')).toBe('secret');
        expect(searchParams.get('search')).toBeNull();
        expect(searchParams.get('trusted')).toBeNull();
        expect(searchParams.get('sortBy')).toBe('fullname');
        expect(searchParams.get('sortDirection')).toBe('ASCENDING');
        expect(searchParams.get('page')).toBe('2');
        expect(searchParams.get('pageSize')).toBe('200');
    });
});
