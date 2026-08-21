import type { AiSupervizeMiniActiveDiscount } from '@/businesses/ai-supervize-mini/discountCode';

const AI_SUPERVIZE_MINI_DISCOUNT_CODE_VALIDATION_API_PATH = '/api/ai-supervize-mini/discount';

type AiSupervizeMiniDiscountCodeValidationResponse = {
    readonly activeDiscount?: unknown;
    readonly error?: unknown;
};

function isAiSupervizeMiniActiveDiscount(value: unknown): value is AiSupervizeMiniActiveDiscount {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const activeDiscount = value as Record<string, unknown>;
    return typeof activeDiscount.code === 'string' && typeof activeDiscount.percent === 'number';
}

/**
 * Checks just the visitor's submitted code. This intentionally exposes neither
 * the discount-code list nor inactive promotions to the browser.
 */
export async function validateAiSupervizeMiniDiscountCode(
    discountCode: string,
): Promise<AiSupervizeMiniActiveDiscount | null> {
    const response = await fetch(AI_SUPERVIZE_MINI_DISCOUNT_CODE_VALIDATION_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode }),
    });
    const responseBody = (await response.json().catch(() => ({}))) as AiSupervizeMiniDiscountCodeValidationResponse;

    if (!response.ok) {
        throw new Error(
            typeof responseBody.error === 'string'
                ? responseBody.error
                : `Discount-code validation failed with status ${response.status}`,
        );
    }

    return isAiSupervizeMiniActiveDiscount(responseBody.activeDiscount) ? responseBody.activeDiscount : null;
}
