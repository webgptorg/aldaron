import { MAXIMAL_DISCOUNT_CODE_LENGTH } from '@/lib/discounts/discountCodeConstants';

/**
 * What a visitor is told about the code they submitted: the discount itself and, when the code is
 * limited, how many uses of it are still left for them.
 */
export type ActiveDiscount = {
    readonly code: string;
    readonly percent: number;
    readonly remainingUseCount: number | null;
};

/**
 * What one submitted code means in every place a page offers, so that a page opened by a `?code=`
 * link can lead the visitor straight to the offer the code is valid in. A place which the code
 * does not reach is present with `null` rather than missing.
 */
export type ActiveDiscountByPlaceId = Readonly<Record<string, ActiveDiscount | null>>;

export type DiscountCodeValues = {
    readonly code: string;
    readonly percent: number;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly isEnabled: boolean;

    /**
     * The places of the application the code is valid in. An empty list means every place at once,
     * which is what `isDiscountCodeValidForAllPlaces` and `isDiscountCodeValidInPlace` read.
     */
    readonly placeIds: readonly string[];

    /**
     * How many registrations may use the code at all, or `null` for an unlimited one
     */
    readonly maximumUseCount: number | null;
};

export type DiscountCode = DiscountCodeValues & {
    readonly id: string;
    readonly useCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
};

const NORMALIZED_DISCOUNT_CODE_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

/**
 * Turns whatever was typed into a form or carried by a `?code=` link into the one representation
 * the database stores, so that a link, a manually typed code and an administered one all agree.
 */
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
 * normalization makes the admin input and the public lookup agree.
 */
export function isDiscountCodeNormalized(value: string): boolean {
    return value.length <= MAXIMAL_DISCOUNT_CODE_LENGTH && NORMALIZED_DISCOUNT_CODE_PATTERN.test(value);
}

/**
 * A discount is usable only inside its configured inclusive validity window.
 */
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

/**
 * How many uses of a limited code are left, or `null` when the code has no limit at all
 */
export function getRemainingDiscountCodeUseCount(
    discountCode: Pick<DiscountCode, 'maximumUseCount' | 'useCount'>,
): number | null {
    return discountCode.maximumUseCount === null
        ? null
        : Math.max(discountCode.maximumUseCount - discountCode.useCount, 0);
}

export function isDiscountCodeExhausted(discountCode: Pick<DiscountCode, 'maximumUseCount' | 'useCount'>): boolean {
    return getRemainingDiscountCodeUseCount(discountCode) === 0;
}

/**
 * The whole question a registration form and a price preview ask about one stored code: is it
 * enabled, within its window, valid in this very place and not yet used up?
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
