/**
 * Product identifier announced in the generated iCalendar file
 */
const ICALENDAR_PRODUCT_ID = '-//Promptbook//Landing page//CS';

/**
 * Percent encoded CRLF pair which the iCalendar format requires between its lines
 *
 * Note: The separator is kept in its encoded form on purpose. A plain `\r\n` string does not survive the build - the
 *       minifier is free to fold it into a template literal, where the language specification normalizes it down to a
 *       bare LF, and strict calendars then refuse the file.
 */
const ENCODED_ICALENDAR_LINE_SEPARATOR = '%0D%0A';

/**
 * One event a visitor can put into their calendar
 */
export type CalendarEvent = {
    /**
     * Stable identity of the event, so that a calendar updates the event it already knows instead of adding another one
     *
     * Note: When it is missing, the moment the event starts identifies it.
     */
    readonly id?: string;

    /**
     * Headline of the event shown in the calendar
     */
    readonly title: string;

    /**
     * Details of the event shown in the calendar
     */
    readonly description: string;

    /**
     * Moment the event starts, as an ISO 8601 string including the time zone offset
     */
    readonly startsAt: string;

    /**
     * Moment the event ends, as an ISO 8601 string including the time zone offset
     */
    readonly endsAt: string;

    /**
     * Absolute url of the page the event was created from
     */
    readonly url: string;
};

/**
 * Ways of putting one event into a calendar
 */
export type CalendarLinks = {
    /**
     * Url opening the event prefilled in Google Calendar
     */
    readonly googleCalendarUrl: string;

    /**
     * Data url of an iCalendar file for Apple Calendar, Outlook and the rest
     */
    readonly icalendarDataUrl: string;
};

/**
 * Formats a moment as the basic UTC timestamp both Google Calendar and the iCalendar format understand
 *
 * @param isoDateTime ISO 8601 string including the time zone offset
 * @returns timestamp such as `20260820T170000Z`
 */
function formatUtcTimestamp(isoDateTime: string): string {
    return new Date(isoDateTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Escapes the characters which carry a special meaning inside an iCalendar text value
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.3.11
 */
function escapeIcalendarText(text: string): string {
    return text.replace(/[\\;,]/g, (character) => `\\${character}`).replace(/\n/g, '\\n');
}

/**
 * Joins the details of an event with its url, so that the link stays reachable in every calendar which shows only the
 * description of an event
 */
function createEventDetails(event: CalendarEvent): string {
    return `${event.description}\n\n${event.url}`;
}

/**
 * Builds the url opening the event prefilled in Google Calendar
 */
function createGoogleCalendarUrl(event: CalendarEvent): string {
    const parameters = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatUtcTimestamp(event.startsAt)}/${formatUtcTimestamp(event.endsAt)}`,
        details: createEventDetails(event),
        location: event.url,
    });

    return `https://calendar.google.com/calendar/render?${parameters.toString()}`;
}

/**
 * Builds the data url of an iCalendar file describing the event
 *
 * Note: The event start doubles as the creation timestamp on purpose - a real timestamp would differ between the server
 *       and the browser render and break the React hydration of the link.
 */
function createIcalendarDataUrl(event: CalendarEvent): string {
    const startTimestamp = formatUtcTimestamp(event.startsAt);

    const icalendarLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:${ICALENDAR_PRODUCT_ID}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${event.id ?? startTimestamp}@${new URL(event.url).hostname}`,
        `DTSTAMP:${startTimestamp}`,
        `DTSTART:${startTimestamp}`,
        `DTEND:${formatUtcTimestamp(event.endsAt)}`,
        `SUMMARY:${escapeIcalendarText(event.title)}`,
        `DESCRIPTION:${escapeIcalendarText(createEventDetails(event))}`,
        `LOCATION:${escapeIcalendarText(event.url)}`,
        `URL:${escapeIcalendarText(event.url)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ];

    return `data:text/calendar;charset=utf-8,${icalendarLines
        .map((line) => encodeURIComponent(line))
        .join(ENCODED_ICALENDAR_LINE_SEPARATOR)}`;
}

/**
 * Turns one event into the links which let a visitor put it into their calendar
 *
 * @param event event to be added into a calendar
 * @returns links for Google Calendar and for every calendar which reads iCalendar files
 */
export function createCalendarLinks(event: CalendarEvent): CalendarLinks {
    return {
        googleCalendarUrl: createGoogleCalendarUrl(event),
        icalendarDataUrl: createIcalendarDataUrl(event),
    };
}
