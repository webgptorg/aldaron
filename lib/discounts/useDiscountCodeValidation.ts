'use client';

import { normalizeDiscountCode, type ActiveDiscount, type ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { validateDiscountCode } from '@/lib/discounts/discountCodeApi';
import { useEffect, useState } from 'react';

const DISCOUNT_CODE_VALIDATION_DELAY_MILLISECONDS = 300;
const DISCOUNT_CODE_NOT_VALIDATED_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit.';

type DiscountCodeValidationOptions = {
    /**
     * What the `?code=` link of the place prefilled, which the visitor may then rewrite
     */
    readonly initialDiscountCode: string;

    /**
     * What the server already resolved about the prefilled code for every place of the page, so
     * that the form does not ask again about an answer it was rendered with
     */
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;

    /**
     * The place the visitor is registering into right now, which may change while they choose
     */
    readonly discountPlaceId: string;
};

export type DiscountCodeValidation = {
    readonly discountCode: string;
    readonly setDiscountCode: (discountCode: string) => void;
    readonly activeDiscount: ActiveDiscount | null;
    readonly isValidationPending: boolean;
    readonly validationError: string | null;
};

/**
 * Keeps one submitted discount code and what the server says about it in the place it is being
 * submitted for. Every place of the application which takes a code shares this one behaviour: the
 * code is normalized before anything is decided about it, a rewritten code is asked about only
 * after the visitor stops typing, and an answer which arrived for an older code or another place
 * is never shown as if it belonged to the current one.
 */
export function useDiscountCodeValidation({
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    discountPlaceId,
}: DiscountCodeValidationOptions): DiscountCodeValidation {
    const [discountCode, setDiscountCode] = useState(initialDiscountCode);
    const [validatedActiveDiscount, setValidatedActiveDiscount] = useState<ActiveDiscount | null>(
        () => initialActiveDiscountByPlaceId[discountPlaceId] ?? null,
    );
    const [isValidationPending, setIsValidationPending] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const normalizedDiscountCode = normalizeDiscountCode(discountCode);

    useEffect(() => {
        setDiscountCode(initialDiscountCode);
    }, [initialDiscountCode]);

    useEffect(() => {
        if (!normalizedDiscountCode) {
            setValidatedActiveDiscount(null);
            setIsValidationPending(false);
            setValidationError(null);
            return;
        }

        const isServerAnswerCurrent =
            normalizedDiscountCode === normalizeDiscountCode(initialDiscountCode) &&
            discountPlaceId in initialActiveDiscountByPlaceId;
        if (isServerAnswerCurrent) {
            setValidatedActiveDiscount(initialActiveDiscountByPlaceId[discountPlaceId] ?? null);
            setIsValidationPending(false);
            setValidationError(null);
            return;
        }

        let isValidationCurrent = true;
        setIsValidationPending(true);
        setValidationError(null);
        const validationTimeoutId = window.setTimeout(() => {
            void validateDiscountCode(discountCode, discountPlaceId)
                .then((loadedActiveDiscount) => {
                    if (isValidationCurrent) {
                        setValidatedActiveDiscount(loadedActiveDiscount);
                    }
                })
                .catch((error: unknown) => {
                    if (!isValidationCurrent) {
                        return;
                    }

                    setValidatedActiveDiscount(null);
                    setValidationError(
                        error instanceof Error ? error.message : DISCOUNT_CODE_NOT_VALIDATED_ERROR_MESSAGE,
                    );
                })
                .finally(() => {
                    if (isValidationCurrent) {
                        setIsValidationPending(false);
                    }
                });
        }, DISCOUNT_CODE_VALIDATION_DELAY_MILLISECONDS);

        return () => {
            isValidationCurrent = false;
            window.clearTimeout(validationTimeoutId);
        };
    }, [
        discountCode,
        discountPlaceId,
        initialActiveDiscountByPlaceId,
        initialDiscountCode,
        normalizedDiscountCode,
    ]);

    return {
        discountCode,
        setDiscountCode,
        // An answer which belongs to a code the visitor has since rewritten must not price anything.
        activeDiscount:
            validatedActiveDiscount !== null && validatedActiveDiscount.code === normalizedDiscountCode
                ? validatedActiveDiscount
                : null,
        isValidationPending,
        validationError,
    };
}
