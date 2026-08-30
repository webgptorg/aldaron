import { formatCzechNumber } from '@/lib/language/czechNumbers';

const CZECH_FULL_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

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
 * Writes a price the way an invoice writes it, for example `25 000 Kč`
 */
export function formatAiTaKrajtaPrice(priceInCzechCrowns: number): string {
    return `${formatCzechNumber(priceInCzechCrowns)} Kč`;
}
