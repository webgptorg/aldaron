import { sendJson } from '@/lib/api/requestJson';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import { DISCOUNT_CODE_VALIDATION_API_PATH } from '@/lib/discounts/discountCodeConstants';

type DiscountCodeValidationResponse = {
    readonly activeDiscount?: unknown;
};

function isActiveDiscount(value: unknown): value is ActiveDiscount {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const activeDiscount = value as Record<string, unknown>;

    return (
        typeof activeDiscount.code === 'string' &&
        typeof activeDiscount.percent === 'number' &&
        (activeDiscount.remainingUseCount === null || typeof activeDiscount.remainingUseCount === 'number')
    );
}

/**
 * Checks one submitted code in the place currently being registered into. It never consumes a use.
 */
export async function validateDiscountCode(
    discountCode: string,
    discountPlaceId: string,
): Promise<ActiveDiscount | null> {
    const responseBody = await sendJson<DiscountCodeValidationResponse>(
        DISCOUNT_CODE_VALIDATION_API_PATH,
        'POST',
        { discountCode, discountPlaceId },
    );

    return isActiveDiscount(responseBody.activeDiscount) ? responseBody.activeDiscount : null;
}
