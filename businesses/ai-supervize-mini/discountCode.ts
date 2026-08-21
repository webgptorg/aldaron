export type AiSupervizeMiniActiveDiscount = {
    readonly code: string;
    readonly percent: number;
};

export type AiSupervizeMiniDiscountCodeValues = {
    readonly code: string;
    readonly percent: number;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly isEnabled: boolean;
    readonly isOnlineWorkshopFollowUp: boolean;
};

export type AiSupervizeMiniDiscountCode = AiSupervizeMiniDiscountCodeValues & {
    readonly id: string;
    readonly createdAt: string;
    readonly updatedAt: string;
};

export const MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_LENGTH = 100;
export const MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_INPUT_LENGTH = 200;
const AI_SUPERVIZE_MINI_NORMALIZED_DISCOUNT_CODE_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

export function normalizeAiSupervizeMiniDiscountCode(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
}

/**
 * Validates the normalized representation stored in the database. Keeping this
 * rule next to normalization makes the admin input and public lookup agree.
 */
export function isAiSupervizeMiniDiscountCodeNormalized(value: string): boolean {
    return (
        value.length <= MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_LENGTH &&
        AI_SUPERVIZE_MINI_NORMALIZED_DISCOUNT_CODE_PATTERN.test(value)
    );
}

/**
 * A discount is usable only inside its configured inclusive validity window.
 */
export function isAiSupervizeMiniDiscountActive(
    discountCode: Pick<AiSupervizeMiniDiscountCodeValues, 'startsAt' | 'endsAt' | 'isEnabled'>,
    currentDate: Date,
): boolean {
    if (!discountCode.isEnabled) {
        return false;
    }

    const startsAtMilliseconds = Date.parse(discountCode.startsAt);
    const endsAtMilliseconds = Date.parse(discountCode.endsAt);
    const currentMilliseconds = currentDate.getTime();

    return currentMilliseconds >= startsAtMilliseconds && currentMilliseconds <= endsAtMilliseconds;
}
