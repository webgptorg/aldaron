import { createPublicEventCalendarEventOrNull } from '@/lib/events/eventCalendar';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const ONLINE_WORKSHOP: WorkshopSummary = {
    id: 'workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

describe('public event calendar event', () => {
    it('uses the public event destination without carrying a community member identity', () => {
        const calendarEvent = createPublicEventCalendarEventOrNull(ONLINE_WORKSHOP);

        expect(calendarEvent).not.toBeNull();
        expect(calendarEvent).toMatchObject({
            id: ONLINE_WORKSHOP.slug,
            title: ONLINE_WORKSHOP.title,
            description: 'Online workshop · Online · Zdarma',
            startsAt: ONLINE_WORKSHOP.startsAt,
            endsAt: ONLINE_WORKSHOP.endsAt,
        });
        const eventUrl = new URL(calendarEvent!.url);
        expect(eventUrl.pathname).toBe('/cs/online-workshop/participant');
        expect(eventUrl.searchParams.get('workshop')).toBe(ONLINE_WORKSHOP.slug);
        expect(eventUrl.searchParams.get('email')).toBeNull();
        expect(eventUrl.searchParams.get('fullname')).toBeNull();
    });

    it('uses the normal expected duration for a published term whose recorded end is open', () => {
        const calendarEvent = createPublicEventCalendarEventOrNull({ ...ONLINE_WORKSHOP, endsAt: null });

        expect(calendarEvent).not.toBeNull();
        expect(Date.parse(calendarEvent!.endsAt) - Date.parse(calendarEvent!.startsAt)).toBe(60 * 60 * 1000);
    });

    it('does not invent a calendar entry for a room which is not an event', () => {
        expect(createPublicEventCalendarEventOrNull({ ...ONLINE_WORKSHOP, event: null })).toBeNull();
    });
});
