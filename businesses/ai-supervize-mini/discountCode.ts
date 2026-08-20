import { AI_SUPERVIZE_MINI_WORKSHOP_CONFIG } from '@/businesses/ai-supervize-mini/config';

export type AiSupervizeMiniActiveDiscount = {
    readonly code: string;
    readonly percent: number;
};

export function normalizeAiSupervizeMiniDiscountCode(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
}

function isAiSupervizeMiniDiscountActive(startsAt: string, endsAt: string, currentDate: Date): boolean {
    const startsAtMilliseconds = Date.parse(startsAt);
    const endsAtMilliseconds = Date.parse(endsAt);
    const currentMilliseconds = currentDate.getTime();

    return currentMilliseconds >= startsAtMilliseconds && currentMilliseconds <= endsAtMilliseconds;
}

/**
 * Return a discount only while its code and Prague-day validity both match.
 * The server calls the same function again before it writes the registration.
 */
export function getAiSupervizeMiniActiveDiscount(
    value: string,
    currentDate: Date = new Date(),
): AiSupervizeMiniActiveDiscount | null {
    const normalizedDiscountCode = normalizeAiSupervizeMiniDiscountCode(value);

    if (!normalizedDiscountCode) {
        return null;
    }

    const matchingDiscount = AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.discounts.find((discount) => {
        const normalizedConfiguredCode = normalizeAiSupervizeMiniDiscountCode(discount.code);

        return (
            normalizedConfiguredCode === normalizedDiscountCode &&
            isAiSupervizeMiniDiscountActive(discount.startsAt, discount.endsAt, currentDate)
        );
    });

    return matchingDiscount === undefined
        ? null
        : { code: normalizedDiscountCode, percent: matchingDiscount.percent };
}
