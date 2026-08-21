import { describe, expect, it } from 'vitest';
import { aiSupervizeMiniDiscountCodeValuesSchema } from './discountCodeSchema';

const VALID_DISCOUNT_CODE_VALUES = {
    code: ' webinar-2026-09-04 ',
    percent: 25,
    startsAt: '2026-09-04T00:00:00+02:00',
    endsAt: '2026-09-04T23:59:59+02:00',
    isEnabled: true,
    isOnlineWorkshopFollowUp: false,
};

describe('AI Supervize Mini discount-code schema', () => {
    it('normalizes the code before it is stored', () => {
        const result = aiSupervizeMiniDiscountCodeValuesSchema.parse(VALID_DISCOUNT_CODE_VALUES);

        expect(result.code).toBe('WEBINAR_2026_09_04');
    });

    it('refuses a discount ending before it starts or outside a valid percentage range', () => {
        expect(
            aiSupervizeMiniDiscountCodeValuesSchema.safeParse({
                ...VALID_DISCOUNT_CODE_VALUES,
                startsAt: '2026-09-05T00:00:00+02:00',
            }).success,
        ).toBe(false);
        expect(
            aiSupervizeMiniDiscountCodeValuesSchema.safeParse({
                ...VALID_DISCOUNT_CODE_VALUES,
                percent: 101,
            }).success,
        ).toBe(false);
    });
});
