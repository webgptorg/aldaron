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
 * The CRLF pair itself, for a calendar which is served as a file rather than carried in a url
 *
 * Note: It is built from its character codes for the very same reason the encoded separator exists - a plain `\r\n`
 *       written in the source does not survive the build.
 */
const ICALENDAR_LINE_SEPARATOR = String.fromCharCode(13, 10);

/**
 * Where Google Calendar receives what a visitor wants to keep
 */
const GOOGLE_CALENDAR_EVENT_URL = 'https://calendar.google.com/calendar/render';
const GOOGLE_CALENDAR_SUBSCRIPTION_URL = 'https://calendar.google.com/calendar/r';

/**
 * Protocols of the address of a published calendar
 *
 * Note: A calendar application subscribes to `webcal:`, which is the very same address as its `https:` one. Handing
 *       it out that way is what makes a click subscribe to the calendar instead of downloading it once.
 */
const WEBCAL_PROTOCOL = 'webcal:';

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

    return `${GOOGLE_CALENDAR_EVENT_URL}?${parameters.toString()}`;
}

/**
 * The lines describing one event inside a calendar
 *
 * Note: The event start doubles as the creation timestamp on purpose - a real timestamp would differ between the server
 *       and the browser render and break the React hydration of the link.
 */
function createIcalendarEventLines(event: CalendarEvent): readonly string[] {
    const startTimestamp = formatUtcTimestamp(event.startsAt);

    return [
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
    ];
}

/**
 * The whole content of an iCalendar file, whether it carries one event or every event of a published calendar
 *
 * @param events events the calendar consists of, which a calendar nothing is published in may have none of
 * @param calendarName how a calendar application names the subscription in its own list of calendars
 */
export function createIcalendarContent(events: readonly CalendarEvent[], calendarName?: string): string {
    const calendarNameLines = calendarName === undefined ? [] : [`X-WR-CALNAME:${escapeIcalendarText(calendarName)}`];

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:${ICALENDAR_PRODUCT_ID}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        ...calendarNameLines,
        ...events.flatMap(createIcalendarEventLines),
        'END:VCALENDAR',
        '',
    ].join(ICALENDAR_LINE_SEPARATOR);
}

/**
 * Builds the data url of an iCalendar file describing the event
 */
function createIcalendarDataUrl(event: CalendarEvent): string {
    return `data:text/calendar;charset=utf-8,${createIcalendarContent([event])
        .split(ICALENDAR_LINE_SEPARATOR)
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

/**
 * Ways of subscribing to a whole published calendar, so that every term it will ever carry arrives on its own
 */
export type CalendarSubscriptionLinks = {
    /**
     * Url which offers the calendar to Google Calendar
     */
    readonly googleCalendarUrl: string;

    /**
     * Url which offers the calendar to Apple Calendar, Outlook and every other calendar application of a device
     */
    readonly webcalUrl: string;
};

/**
 * Turns the address of a published calendar into the links which subscribe to it
 *
 * @param calendarFeedUrl absolute `https:` url the calendar is served from
 */
export function createCalendarSubscriptionLinks(calendarFeedUrl: string): CalendarSubscriptionLinks {
    const calendarUrl = new URL(calendarFeedUrl);
    const webcalUrl = `${WEBCAL_PROTOCOL}//${calendarUrl.host}${calendarUrl.pathname}${calendarUrl.search}`;
    const parameters = new URLSearchParams({ cid: webcalUrl });

    return {
        googleCalendarUrl: `${GOOGLE_CALENDAR_SUBSCRIPTION_URL}?${parameters.toString()}`,
        webcalUrl,
    };
}

/**
 * Names an iCalendar file after what it describes
 */
export function createCalendarFileName(calendarIdentifier: string): string {
    return `${calendarIdentifier}.ics`;
}
