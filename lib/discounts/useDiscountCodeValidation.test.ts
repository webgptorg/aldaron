import {
    isDiscountCodeReadyForSubmission,
    type DiscountCodeValidation,
} from '@/lib/discounts/useDiscountCodeValidation';
import { describe, expect, it } from 'vitest';

function createValidation(validation: Partial<DiscountCodeValidation>): DiscountCodeValidation {
    return {
        discountCode: '',
        setDiscountCode: () => undefined,
        activeDiscount: null,
        isValidationPending: false,
        validationError: null,
        ...validation,
    };
}

describe('discount code readiness', () => {
    it('is ready when no code was entered, because a code is never required', () => {
        expect(isDiscountCodeReadyForSubmission(createValidation({}))).toBe(true);
        expect(isDiscountCodeReadyForSubmission(createValidation({ discountCode: '   ' }))).toBe(true);
    });

    it('waits for the answer about a code which is still being checked', () => {
        expect(
            isDiscountCodeReadyForSubmission(createValidation({ discountCode: 'SLEVA', isValidationPending: true })),
        ).toBe(false);
    });

    it('refuses a code which is not active here', () => {
        expect(isDiscountCodeReadyForSubmission(createValidation({ discountCode: 'SLEVA' }))).toBe(false);
    });

    it('refuses a code which could not be checked at all', () => {
        expect(
            isDiscountCodeReadyForSubmission(
                createValidation({
                    discountCode: 'SLEVA',
                    activeDiscount: { code: 'SLEVA', percent: 20, remainingUseCount: null },
                    validationError: 'Slevový kód se nepodařilo ověřit.',
                }),
            ),
        ).toBe(false);
    });

    it('is ready once the code was answered as active', () => {
        expect(
            isDiscountCodeReadyForSubmission(
                createValidation({
                    discountCode: 'sleva',
                    activeDiscount: { code: 'SLEVA', percent: 20, remainingUseCount: 3 },
                }),
            ),
        ).toBe(true);
    });
});
