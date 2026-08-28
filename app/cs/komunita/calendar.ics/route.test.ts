import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadPublishedWorkshopSummariesMock } = vi.hoisted(() => ({
    loadPublishedWorkshopSummariesMock: vi.fn(),
}));

vi.mock('@/lib/workshops/workshopPublic', () => ({
    loadPublishedWorkshopSummaries: loadPublishedWorkshopSummariesMock,
}));

import { GET } from './route';

const PUBLISHED_WORKSHOPS: readonly WorkshopSummary[] = [
    {
        id: 'online-workshop-id',
        kind: 'workshop',
        event: DEFAULT_EVENT_DETAILS,
        slug: 'production-ai-2026-09-10',
        title: 'Produkční kód s AI agenty',
        startsAt: '2026-09-10T19:00:00+02:00',
        endsAt: '2026-09-10T20:30:00+02:00',
        isPublished: true,
    },
    {
        id: 'ai-supervize-mini-id',
        kind: 'workshop',
        event: {
            ...DEFAULT_EVENT_DETAILS,
            type: 'ai-supervize-mini',
            locationKind: 'onsite',
            locationLabel: 'Praha',
            priceCzk: 12000,
        },
        slug: 'ai-supervize-mini-2026-09-12',
        title: 'AI Supervize Mini',
        startsAt: '2026-09-12T10:00:00+02:00',
        endsAt: '2026-09-12T16:00:00+02:00',
        isPublished: true,
    },
    {
        id: 'community-id',
        kind: 'community',
        event: null,
        slug: 'komunita',
        title: 'Komunita Promptbooku',
        startsAt: '2026-09-01T10:00:00+02:00',
        endsAt: null,
        isPublished: true,
    },
];

describe('community calendar feed', () => {
    beforeEach(() => {
        loadPublishedWorkshopSummariesMock.mockReset();
    });

    it('serves the same published event terms as a current named iCalendar feed', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue(PUBLISHED_WORKSHOPS);

        const response = await GET();
        const calendarContent = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/calendar; charset=utf-8');
        expect(response.headers.get('Content-Disposition')).toBe(
            'inline; filename="promptbook-community-events.ics"',
        );
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(calendarContent).toContain('X-WR-CALNAME:Termíny akcí Promptbooku');
        expect(calendarContent.match(/BEGIN:VEVENT/g)).toHaveLength(2);
        expect(calendarContent).toContain('SUMMARY:Produkční kód s AI agenty');
        expect(calendarContent).toContain('SUMMARY:AI Supervize Mini');
        expect(calendarContent).not.toContain('SUMMARY:Komunita Promptbooku');
        expect(calendarContent).toContain(
            'URL:https://ptbk.io/cs/online-workshop/participant?workshop=production-ai-2026-09-10',
        );
        expect(calendarContent).not.toContain('email=');
    });

    it('keeps an empty feed valid while no event term is published', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue([]);

        const response = await GET();
        const calendarContent = await response.text();

        expect(calendarContent).toContain('BEGIN:VCALENDAR');
        expect(calendarContent).toContain('END:VCALENDAR');
        expect(calendarContent).not.toContain('BEGIN:VEVENT');
    });
});
