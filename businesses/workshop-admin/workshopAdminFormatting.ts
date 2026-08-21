const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });

/**
 * Formats a server timestamp consistently across the workshop administration.
 */
export function formatWorkshopAdminDateTime(timestamp: string): string {
    return CZECH_DATE_TIME_FORMAT.format(new Date(timestamp));
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
