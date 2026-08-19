import { createCalendarLinks, type CalendarEvent } from '@/lib/calendar/create-calendar-links';
import { describe, expect, it } from 'vitest';

const WORKSHOP_EVENT: CalendarEvent = {
    id: 'online-workshop-2026-08-20',
    title: 'Karel <> Pavol - Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    url: 'https://ptbk.io/cs/online-workshop/participant?email=karel%40firma.cz&fullname=Karel+Nov%C3%A1k',
};

function readIcalendarLines(icalendarDataUrl: string): readonly string[] {
    return decodeURIComponent(icalendarDataUrl.replace('data:text/calendar;charset=utf-8,', '')).split('\r\n');
}

describe('calendar links', () => {
    it('prefills the event in Google Calendar', () => {
        const { googleCalendarUrl } = createCalendarLinks(WORKSHOP_EVENT);
        const parameters = new URL(googleCalendarUrl).searchParams;

        expect(parameters.get('text')).toBe(WORKSHOP_EVENT.title);
        expect(parameters.get('dates')).toBe('20260820T170000Z/20260820T183000Z');
        expect(parameters.get('details')).toContain(WORKSHOP_EVENT.url);
        expect(parameters.get('location')).toBe(WORKSHOP_EVENT.url);
    });

    it('keeps the link to the event in every calendar which reads the iCalendar file', () => {
        const icalendarLines = readIcalendarLines(createCalendarLinks(WORKSHOP_EVENT).icalendarDataUrl);

        expect(icalendarLines).toContain(`URL:${WORKSHOP_EVENT.url}`);
        expect(icalendarLines).toContain(`LOCATION:${WORKSHOP_EVENT.url}`);
        expect(icalendarLines).toContain(`DESCRIPTION:${WORKSHOP_EVENT.description}\\n\\n${WORKSHOP_EVENT.url}`);
    });

    it('identifies the event by its own identity, so that a calendar updates it instead of duplicating it', () => {
        const icalendarLines = readIcalendarLines(createCalendarLinks(WORKSHOP_EVENT).icalendarDataUrl);
        const eventWithoutId = { ...WORKSHOP_EVENT, id: undefined };

        expect(icalendarLines).toContain('UID:online-workshop-2026-08-20@ptbk.io');
        expect(readIcalendarLines(createCalendarLinks(eventWithoutId).icalendarDataUrl)).toContain(
            'UID:20260820T170000Z@ptbk.io',
        );
    });
});
