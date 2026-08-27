const CZECH_SHORTCODE_LINK_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

/**
 * Formats the timestamps of a short link and its click history in the same way throughout the administration.
 */
export function formatShortcodeLinkDateTime(timestamp: string | null): string {
    return timestamp === null ? '—' : CZECH_SHORTCODE_LINK_DATE_TIME_FORMAT.format(new Date(timestamp));
}
