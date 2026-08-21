import {
    isAiSupervizeMiniDiscountCodeNormalized,
    MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_INPUT_LENGTH,
    MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_LENGTH,
    normalizeAiSupervizeMiniDiscountCode,
    type AiSupervizeMiniDiscountCodeValues,
} from '@/businesses/ai-supervize-mini/discountCode';
import { z } from 'zod';

const MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_PERCENT = 100;

const aiSupervizeMiniDiscountCodeSchema = z
    .string()
    .trim()
    .min(1, 'Zadejte slevový kód.')
    .max(MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_INPUT_LENGTH, 'Slevový kód je příliš dlouhý.')
    .transform(normalizeAiSupervizeMiniDiscountCode)
    .refine(isAiSupervizeMiniDiscountCodeNormalized, {
        message: `Slevový kód musí po normalizaci obsahovat nejvýše ${MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_LENGTH} písmen nebo číslic.`,
    });

/**
 * One complete discount-code write. Both creation and editing use this shape,
 * which keeps the validation and database mapping identical.
 */
export const aiSupervizeMiniDiscountCodeValuesSchema: z.ZodType<AiSupervizeMiniDiscountCodeValues> = z
    .object({
        code: aiSupervizeMiniDiscountCodeSchema,
        percent: z
            .number()
            .int('Sleva musí být celé procento.')
            .min(1, 'Sleva musí být alespoň 1 %.')
            .max(MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_PERCENT, 'Sleva může být nejvýše 100 %.'),
        startsAt: z.string().datetime({ offset: true }),
        endsAt: z.string().datetime({ offset: true }),
        isEnabled: z.boolean(),
        isOnlineWorkshopFollowUp: z.boolean(),
    })
    .refine((discountCode) => Date.parse(discountCode.endsAt) >= Date.parse(discountCode.startsAt), {
        message: 'Konec platnosti musí být po začátku platnosti.',
        path: ['endsAt'],
    });
