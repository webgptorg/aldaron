'use client';

import { Input } from '@/components/ui/input';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { getDiscountCodeMessage } from '@/lib/discounts/discountCodeMessages';
import type { DiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { BadgePercent } from 'lucide-react';

type DiscountCodeFieldProps = {
    readonly inputId: string;
    readonly validation: DiscountCodeValidation;
};

/**
 * The one discount-code field of the application: every place which takes a code shows the same
 * input, the same normalization and the same answer about the code, including how many uses of a
 * limited code are still left.
 */
export function DiscountCodeField({ inputId, validation }: DiscountCodeFieldProps) {
    const { discountCode, setDiscountCode, activeDiscount, isValidationPending, validationError } = validation;

    return (
        <div>
            <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
                Slevový kód
            </label>
            <div className="relative mt-2">
                <BadgePercent className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                    id={inputId}
                    name={inputId}
                    value={discountCode}
                    onChange={(event) => setDiscountCode(event.target.value)}
                    maxLength={MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH}
                    className="h-11 pl-10 uppercase"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                />
            </div>
            <p className="mt-1 text-xs text-slate-500">
                {getDiscountCodeMessage({ discountCode, activeDiscount, isValidationPending, validationError })}
            </p>
        </div>
    );
}
