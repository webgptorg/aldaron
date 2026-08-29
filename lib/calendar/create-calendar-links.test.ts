import {
    createCalendarLinks,
    createCalendarSubscriptionLinks,
    createIcalendarContent,
    type CalendarEvent,
} from '@/lib/calendar/create-calendar-links';
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

describe('published calendar', () => {
    it('carries every event of the calendar under the name of that calendar', () => {
        const icalendarLines = createIcalendarContent(
            [WORKSHOP_EVENT, { ...WORKSHOP_EVENT, id: 'online-workshop-2026-09-10' }],
            'Termíny akcí Promptbooku',
        ).split('\r\n');

        expect(icalendarLines).toContain('X-WR-CALNAME:Termíny akcí Promptbooku');
        expect(icalendarLines.filter((icalendarLine) => icalendarLine === 'BEGIN:VEVENT')).toHaveLength(2);
        expect(icalendarLines[0]).toBe('BEGIN:VCALENDAR');
        expect(icalendarLines[icalendarLines.length - 2]).toBe('END:VCALENDAR');
    });

    it('stays a calendar even while nothing at all is published in it', () => {
        const icalendarLines = createIcalendarContent([]).split('\r\n');

        expect(icalendarLines).toContain('BEGIN:VCALENDAR');
        expect(icalendarLines).toContain('END:VCALENDAR');
        expect(icalendarLines).not.toContain('BEGIN:VEVENT');
        expect(icalendarLines.some((icalendarLine) => icalendarLine.startsWith('X-WR-CALNAME'))).toBe(false);
    });

    it('subscribes a calendar application to the published calendar rather than downloading it once', () => {
        const { googleCalendarUrl, webcalUrl } = createCalendarSubscriptionLinks(
            'https://ptbk.io/cs/komunita/calendar.ics',
        );

        expect(webcalUrl).toBe('webcal://ptbk.io/cs/komunita/calendar.ics');
        expect(new URL(googleCalendarUrl).searchParams.get('cid')).toBe(webcalUrl);
        expect(googleCalendarUrl.startsWith('https://calendar.google.com/calendar/r?')).toBe(true);
    });
});
