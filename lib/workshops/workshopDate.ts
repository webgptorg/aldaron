import { DEFAULT_WORKSHOP_DURATION_MINUTES } from '@/lib/workshops/workshopConstants';

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

/**
 * Formats the start time of a Czech workshop in Prague time.
 */
export function formatCzechWorkshopTime(startsAt: string): string {
    return CZECH_WORKSHOP_TIME_FORMAT.format(new Date(startsAt));
}

/**
 * Describes the calendar duration recorded for a workshop. A workshop without an end follows the same one-hour
 * default as its calendar invitation.
 */
export function formatCzechWorkshopDuration(startsAt: string, endsAt: string | null): string {
    const startsAtMilliseconds = Date.parse(startsAt);
    const endsAtMilliseconds = endsAt === null ? NaN : Date.parse(endsAt);
    const durationMinutes =
        Number.isFinite(startsAtMilliseconds) && Number.isFinite(endsAtMilliseconds) && endsAtMilliseconds > startsAtMilliseconds
            ? Math.round((endsAtMilliseconds - startsAtMilliseconds) / MILLISECONDS_PER_MINUTE)
            : DEFAULT_WORKSHOP_DURATION_MINUTES;

    return `${durationMinutes} minut`;
}
