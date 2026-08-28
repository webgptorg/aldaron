import { DEFAULT_WORKSHOP_DURATION_MINUTES } from '@/lib/workshops/workshopConstants';
import { getWorkshopExpectedEndsAtMilliseconds } from '@/lib/workshops/workshopPhase';

const CZECH_LOCALE = 'cs-CZ';
const PRAGUE_TIME_ZONE = 'Europe/Prague';
const MILLISECONDS_PER_MINUTE = 60 * 1000;

const CZECH_WORKSHOP_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

const CZECH_WORKSHOP_TIME_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * Formats an occurrence date in the timezone in which Czech workshops take place, independently of the server's
 * timezone.
 */
export function formatCzechWorkshopDate(startsAt: string): string {
    return CZECH_WORKSHOP_DATE_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_SHORT_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    dateStyle: 'short',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * Names an occurrence date as shortly as a label beside a title can, in the same Prague time as its full date.
 */
export function formatCzechWorkshopShortDate(startsAt: string): string {
    return CZECH_WORKSHOP_SHORT_DATE_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_DAY_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The day one occurrence falls on, for example `4. 9. 2026`
 *
 * Note: This is how a term a visitor has to put in their calendar is named, so it says its year in full rather than
 *       shortening it the way a compact label beside a title does.
 */
export function formatCzechWorkshopDay(startsAt: string): string {
    return CZECH_WORKSHOP_DAY_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_DAY_AND_MONTH_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The day one occurrence falls on without its year, for example `4. 9.`
 *
 * Note: This is how a term is named where several terms are listed beside each other and the year they share would
 *       only be repeated.
 */
export function formatCzechWorkshopDayAndMonth(startsAt: string): string {
    return CZECH_WORKSHOP_DAY_AND_MONTH_FORMAT.format(new Date(startsAt));
}

const PRAGUE_CALENDAR_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The calendar day one occurrence falls on in Prague, written as `2026-09-04`
 *
 * Note: This is the machine-readable day of a term rather than a label for a visitor, which is what identifies a term
 *       by the day it is held on.
 */
export function formatPragueCalendarDate(startsAt: string): string {
    return PRAGUE_CALENDAR_DATE_FORMAT.format(new Date(startsAt));
}

/**
 * The time span one occurrence runs for in Prague time, for example `10:00–16:00`
 */
export function formatCzechWorkshopTimeRange(startsAt: string, endsAt: string | null): string {
    const startTime = formatCzechWorkshopTime(startsAt);
    return endsAt === null ? startTime : `${startTime}–${formatCzechWorkshopTime(endsAt)}`;
}

/**
 * Formats the start time of a Czech workshop in Prague time.
 */
export function formatCzechWorkshopTime(startsAt: string): string {
    return CZECH_WORKSHOP_TIME_FORMAT.format(new Date(startsAt));
}

/**
 * Describes how long a workshop is expected to take. A workshop whose end is still left open is announced with the
 * same usual length as its calendar invitation, because a visitor is told how long to set aside before anybody can
 * know when the workshop will really be ended.
 */
export function formatCzechWorkshopDuration(startsAt: string, endsAt: string | null): string {
    const startsAtMilliseconds = Date.parse(startsAt);
    const durationMinutes = Number.isFinite(startsAtMilliseconds)
        ? Math.round(
              (getWorkshopExpectedEndsAtMilliseconds({ startsAt, endsAt }) - startsAtMilliseconds) /
                  MILLISECONDS_PER_MINUTE,
          )
        : DEFAULT_WORKSHOP_DURATION_MINUTES;

    return `${durationMinutes} minut`;
}
