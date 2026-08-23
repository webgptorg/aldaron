import { MAXIMAL_DISCOUNT_CODE_LENGTH } from '@/lib/discounts/discountCodeConstants';

/**
 * What a visitor may see about a code which is active in the place they are viewing.
 */
export type ActiveDiscount = {
    readonly code: string;
    readonly percent: number;
    readonly remainingUseCount: number | null;
};

export type ActiveDiscountByPlaceId = Readonly<Record<string, ActiveDiscount | null>>;

export type DiscountCodeValues = {
    readonly code: string;
    readonly percent: number;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly isEnabled: boolean;

    /** Empty means every current and future discount place. */
    readonly placeIds: readonly string[];

    /** Null means unlimited use. */
    readonly maximumUseCount: number | null;
};

export type DiscountCode = DiscountCodeValues & {
    readonly id: string;
    readonly useCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
};

const NORMALIZED_DISCOUNT_CODE_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

export function normalizeDiscountCode(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
}

/**
 * Validates the normalized representation stored in the database. Keeping this rule next to
 * normalization makes the admin input and public lookup agree.
 */
export function isDiscountCodeNormalized(value: string): boolean {
    return value.length <= MAXIMAL_DISCOUNT_CODE_LENGTH && NORMALIZED_DISCOUNT_CODE_PATTERN.test(value);
}

export function isDiscountCodeActive(
    discountCode: Pick<DiscountCodeValues, 'startsAt' | 'endsAt' | 'isEnabled'>,
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

export function isDiscountCodeValidForAllPlaces(discountCode: Pick<DiscountCodeValues, 'placeIds'>): boolean {
    return discountCode.placeIds.length === 0;
}

export function isDiscountCodeValidInPlace(
    discountCode: Pick<DiscountCodeValues, 'placeIds'>,
    discountPlaceId: string,
): boolean {
    return isDiscountCodeValidForAllPlaces(discountCode) || discountCode.placeIds.includes(discountPlaceId);
}

export function getRemainingDiscountCodeUseCount(
    discountCode: Pick<DiscountCode, 'maximumUseCount' | 'useCount'>,
): number | null {
    return discountCode.maximumUseCount === null
        ? null
        : Math.max(discountCode.maximumUseCount - discountCode.useCount, 0);
}

export function isDiscountCodeExhausted(
    discountCode: Pick<DiscountCode, 'maximumUseCount' | 'useCount'>,
): boolean {
    return getRemainingDiscountCodeUseCount(discountCode) === 0;
}

/**
 * The one shared answer used by previews and registration-time consumption.
 */
export function isDiscountCodeUsableInPlace(
    discountCode: DiscountCode,
    discountPlaceId: string,
    currentDate: Date,
): boolean {
    return (
        isDiscountCodeActive(discountCode, currentDate) &&
        isDiscountCodeValidInPlace(discountCode, discountPlaceId) &&
        !isDiscountCodeExhausted(discountCode)
    );
}

export function createActiveDiscount(discountCode: DiscountCode): ActiveDiscount {
    return {
        code: discountCode.code,
        percent: discountCode.percent,
        remainingUseCount: getRemainingDiscountCodeUseCount(discountCode),
    };
}
