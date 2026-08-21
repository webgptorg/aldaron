/**
 * Converts a timestamp for a native datetime-local input in the visitor's
 * local time zone.
 */
export function toDateTimeLocalValue(isoTimestamp: string | null): string {
    if (isoTimestamp === null) {
        return '';
    }

    const date = new Date(isoTimestamp);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 16);
}

/**
 * Converts a native datetime-local input value back to an ISO timestamp.
 */
export function fromDateTimeLocalValue(localTimestamp: string): string | null {
    if (!localTimestamp) {
        return null;
    }

    const timestamp = new Date(localTimestamp);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}
