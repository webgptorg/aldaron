import { describe, expect, it } from 'vitest';
import {
    getDiscountCodeMessage,
    INACTIVE_DISCOUNT_CODE_MESSAGE,
    OPTIONAL_DISCOUNT_CODE_MESSAGE,
    PENDING_DISCOUNT_CODE_MESSAGE,
    UNCHECKED_DISCOUNT_CODE_MESSAGE,
} from './discountCodeMessages';

const UNLIMITED_ACTIVE_DISCOUNT = { code: 'WEBINAR', percent: 25, remainingUseCount: null };

function createMessageState(values: Partial<Parameters<typeof getDiscountCodeMessage>[0]> = {}) {
    return {
        discountCode: 'WEBINAR',
        activeDiscount: UNLIMITED_ACTIVE_DISCOUNT,
        isValidationPending: false,
        validationError: null,
        ...values,
    };
}

describe('discount-code message', () => {
    it('says the field is optional while it is empty', () => {
        expect(getDiscountCodeMessage(createMessageState({ discountCode: '   ' }))).toBe(
            OPTIONAL_DISCOUNT_CODE_MESSAGE,
        );
    });

    it('says a code is being checked before it says anything about it', () => {
        expect(getDiscountCodeMessage(createMessageState({ isValidationPending: true }))).toBe(
            PENDING_DISCOUNT_CODE_MESSAGE,
        );
    });

    it('promises to check the code again when it could not be checked now', () => {
        expect(getDiscountCodeMessage(createMessageState({ validationError: 'Network error' }))).toBe(
            UNCHECKED_DISCOUNT_CODE_MESSAGE,
        );
    });

    it('says a code which does not apply here is not active here', () => {
        expect(getDiscountCodeMessage(createMessageState({ activeDiscount: null }))).toBe(
            INACTIVE_DISCOUNT_CODE_MESSAGE,
        );
    });

    it('says the discount, and how many uses are left of a limited code', () => {
        expect(getDiscountCodeMessage(createMessageState())).toBe('Aktivní sleva 25 %.');
        expect(
            getDiscountCodeMessage(
                createMessageState({ activeDiscount: { ...UNLIMITED_ACTIVE_DISCOUNT, remainingUseCount: 3 } }),
            ),
        ).toBe('Aktivní sleva 25 %. Zbývající počet použití: 3.');
    });
});
