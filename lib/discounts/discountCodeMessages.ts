import type { ActiveDiscount } from '@/lib/discounts/discountCode';

export const OPTIONAL_DISCOUNT_CODE_MESSAGE = 'Volitelné.';
export const PENDING_DISCOUNT_CODE_MESSAGE = 'Ověřuji slevový kód…';
export const UNCHECKED_DISCOUNT_CODE_MESSAGE = 'Slevový kód se nepodařilo ověřit. Při odeslání jej ověříme znovu.';
export const INACTIVE_DISCOUNT_CODE_MESSAGE = 'Tento kód zde není aktivní.';
export const EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE =
    'Slevový kód byl mezitím vyčerpán. Zkontrolujte prosím cenu a odešlete registraci znovu.';

type DiscountCodeMessageState = {
    readonly discountCode: string;
    readonly activeDiscount: ActiveDiscount | null;
    readonly isValidationPending: boolean;
    readonly validationError: string | null;
};

export function getDiscountCodeMessage({
    discountCode,
    activeDiscount,
    isValidationPending,
    validationError,
}: DiscountCodeMessageState): string {
    if (!discountCode.trim()) {
        return OPTIONAL_DISCOUNT_CODE_MESSAGE;
    }

    if (isValidationPending) {
        return PENDING_DISCOUNT_CODE_MESSAGE;
    }

    if (validationError !== null) {
        return UNCHECKED_DISCOUNT_CODE_MESSAGE;
    }

    if (activeDiscount === null) {
        return INACTIVE_DISCOUNT_CODE_MESSAGE;
    }

    const activeDiscountMessage = `Aktivní sleva ${activeDiscount.percent} %.`;

    return activeDiscount.remainingUseCount === null
        ? activeDiscountMessage
        : `${activeDiscountMessage} Zbývající počet použití: ${activeDiscount.remainingUseCount}.`;
}
