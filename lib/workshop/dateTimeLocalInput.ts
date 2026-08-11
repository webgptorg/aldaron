/**
 * Write a moment the way a `datetime-local` input wants it, which is the local time without any zone
 *
 * Note: The administration fills the times in its own timezone, the database keeps them as absolute moments, this is
 *       the one place which translates between the two.
 */
export function toDateTimeLocalInputValue(isoDateTime: string | null): string {
    if (isoDateTime === null || isoDateTime === '') {
        return '';
    }

    const dateTime = new Date(isoDateTime);

    if (Number.isNaN(dateTime.getTime())) {
        return '';
    }

    const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60 * 1000);

    // Note: `YYYY-MM-DDTHH:mm` is exactly the first 16 characters of the ISO notation
    return localDateTime.toISOString().slice(0, 16);
}

/**
 * Read the local time filled into a `datetime-local` input as an absolute moment
 */
export function fromDateTimeLocalInputValue(inputValue: string): string | null {
    if (inputValue.trim() === '') {
        return null;
    }

    const dateTime = new Date(inputValue);

    if (Number.isNaN(dateTime.getTime())) {
        return null;
    }

    return dateTime.toISOString();
}
