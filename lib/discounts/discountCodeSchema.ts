import { isDiscountCodeNormalized, normalizeDiscountCode, type DiscountCodeValues } from '@/lib/discounts/discountCode';
import {
    MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH,
    MAXIMAL_DISCOUNT_CODE_LENGTH,
    MAXIMAL_DISCOUNT_CODE_USE_COUNT,
    MAXIMAL_DISCOUNT_PERCENT,
} from '@/lib/discounts/discountCodeConstants';
import { isKnownDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { z } from 'zod';

const discountCodeSchema = z
    .string()
    .trim()
    .min(1, 'Zadejte slevový kód.')
    .max(MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH, 'Slevový kód je příliš dlouhý.')
    .transform(normalizeDiscountCode)
    .refine(isDiscountCodeNormalized, {
        message: `Slevový kód musí po normalizaci obsahovat nejvýše ${MAXIMAL_DISCOUNT_CODE_LENGTH} písmen nebo číslic.`,
    });

/**
 * An empty list of places is a code valid everywhere, while every named place has to be one the
 * application really offers, so that a typo can never make a code valid nowhere at all.
 */
const discountPlaceIdsSchema = z
    .array(z.string().refine(isKnownDiscountPlaceId, { message: 'Neznámé místo platnosti slevového kódu.' }))
    .transform((discountPlaceIds) => Array.from(new Set(discountPlaceIds)));

const maximumUseCountSchema = z
    .number()
    .int('Maximální počet použití musí být celé číslo.')
    .min(1, 'Maximální počet použití musí být alespoň 1.')
    .max(MAXIMAL_DISCOUNT_CODE_USE_COUNT, `Maximální počet použití může být nejvýše ${MAXIMAL_DISCOUNT_CODE_USE_COUNT}.`)
    .nullable();

/**
 * One complete discount-code write. Both creation and editing use this shape, which keeps the
 * validation and the database mapping identical.
 */
export const discountCodeValuesSchema: z.ZodType<DiscountCodeValues> = z
    .object({
        code: discountCodeSchema,
        percent: z
            .number()
            .int('Sleva musí být celé procento.')
            .min(1, 'Sleva musí být alespoň 1 %.')
            .max(MAXIMAL_DISCOUNT_PERCENT, `Sleva může být nejvýše ${MAXIMAL_DISCOUNT_PERCENT} %.`),
        startsAt: z.string().datetime({ offset: true }),
        endsAt: z.string().datetime({ offset: true }),
        isEnabled: z.boolean(),
        placeIds: discountPlaceIdsSchema,
        maximumUseCount: maximumUseCountSchema,
    })
    .refine((discountCode) => Date.parse(discountCode.endsAt) >= Date.parse(discountCode.startsAt), {
        message: 'Konec platnosti musí být po začátku platnosti.',
        path: ['endsAt'],
    });
