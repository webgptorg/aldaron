const FREE_EVENT_PRICE_LABEL = 'Zdarma';

export function formatCzechKoruna(amountCzk: number): string {
    return `${amountCzk.toLocaleString('cs-CZ')} Kč`;
}

/**
 * Whether nobody pays for one term, which is what a price of zero means
 */
export function isEventFree(priceCzk: number): boolean {
    return priceCzk <= 0;
}

/**
 * The price of one seat as a visitor reads it, where a free event says so instead of naming zero
 */
export function formatEventPrice(priceCzk: number): string {
    return isEventFree(priceCzk) ? FREE_EVENT_PRICE_LABEL : formatCzechKoruna(priceCzk);
}
