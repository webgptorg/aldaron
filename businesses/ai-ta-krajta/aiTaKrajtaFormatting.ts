import { formatCzechNumber } from '@/lib/language/czechNumbers';

const CZECH_FULL_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Writes the day an episode came out, for example `27. srpna 2026`
 */
export function formatAiTaKrajtaDate(isoDate: string): string {
    return CZECH_FULL_DATE_FORMAT.format(new Date(isoDate));
}

/**
 * Writes a price the way an invoice writes it, for example `25 000 Kč`
 */
export function formatAiTaKrajtaPrice(priceInCzechCrowns: number): string {
    return `${formatCzechNumber(priceInCzechCrowns)} Kč`;
}
