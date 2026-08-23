const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
const CZECH_CLOCK_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' });
const CZECH_DAY_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});
const CZECH_DAY_FORMAT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric' });

/**
 * A span of time which is still read as a clock, above which the day has to be named as well
 */
const WHOLE_DAY_MILLISECONDS = 24 * 60 * 60 * 1_000;

/**
 * Formats a server timestamp consistently across the workshop administration.
 */
export function formatWorkshopAdminDateTime(timestamp: string): string {
    return CZECH_DATE_TIME_FORMAT.format(new Date(timestamp));
}

/**
 * Names one moment of the overview graph as shortly as the shown span allows
 *
 * Note: An hour-long workshop is read as a clock, a week of a permanent room by the day, so the axis never repeats the
 *       very same date under every single tick.
 */
export function formatWorkshopOverviewAxisTime(timestampMilliseconds: number, rangeMilliseconds: number): string {
    const timestamp = new Date(timestampMilliseconds);

    if (rangeMilliseconds <= WHOLE_DAY_MILLISECONDS) {
        return CZECH_CLOCK_TIME_FORMAT.format(timestamp);
    }

    return rangeMilliseconds <= 14 * WHOLE_DAY_MILLISECONDS
        ? CZECH_DAY_TIME_FORMAT.format(timestamp)
        : CZECH_DAY_FORMAT.format(timestamp);
}

/**
 * Names the moment one point of the overview graph begins at, in full, for a reader who asked about that point
 */
export function formatWorkshopOverviewPointTime(timestampMilliseconds: number): string {
    return CZECH_DATE_TIME_FORMAT.format(new Date(timestampMilliseconds));
}

/**
 * Names an audience in the Czech grammatical number which belongs to its size.
 */
export function formatWorkshopParticipantCount(participantCount: number): string {
    if (participantCount === 1) {
        return '1 účastník';
    }

    return participantCount >= 2 && participantCount <= 4
        ? `${participantCount} účastníci`
        : `${participantCount} účastníků`;
}

/**
 * Turns active seconds into a compact, human-readable duration.
 */
export function formatWorkshopActiveDuration(activeDurationSeconds: number): string {
    if (activeDurationSeconds < 60) {
        return 'méně než minutu';
    }

    const totalMinutes = Math.floor(activeDurationSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours === 0 ? `${minutes} min` : minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
