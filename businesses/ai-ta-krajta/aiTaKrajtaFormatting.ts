const CZECH_FULL_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
const CZECH_NUMBER_FORMAT = new Intl.NumberFormat('cs-CZ');

/**
 * Writes the day an episode came out, for example `27. srpna 2026`
 */
export function formatAiTaKrajtaDate(isoDate: string): string {
    return CZECH_FULL_DATE_FORMAT.format(new Date(isoDate));
}

/**
 * Writes the month an episode came out in the case which follows the Czech `od`, for example `května 2025`
 *
 * Note: `Intl` only declines a month name when it formats a whole date, so the day is formatted along with it and
 *       then dropped. Asking for the month on its own would give the nominative `květen`, which reads wrong after
 *       `od`.
 */
export function formatAiTaKrajtaMonthAfterOd(isoDate: string): string {
    return CZECH_FULL_DATE_FORMAT.format(new Date(isoDate)).replace(/^\d+\.\s*/, '');
}

/**
 * Picks the Czech form of a word which belongs after a number
 *
 * @param count how many there are
 * @param forms the form after one, the form after two up to four, and the form after five and more
 */
export function formatCzechCountedNoun(
    count: number,
    forms: readonly [singular: string, few: string, many: string],
): string {
    const [singular, few, many] = forms;
    const noun = count === 1 ? singular : count >= 2 && count <= 4 ? few : many;

    return `${CZECH_NUMBER_FORMAT.format(count)} ${noun}`;
}

/**
 * Writes a price the way an invoice writes it, for example `25 000 Kč`
 */
export function formatAiTaKrajtaPrice(priceInCzechCrowns: number): string {
    return `${CZECH_NUMBER_FORMAT.format(priceInCzechCrowns)} Kč`;
}
