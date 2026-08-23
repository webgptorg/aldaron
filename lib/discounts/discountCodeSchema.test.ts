import { AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { describe, expect, it } from 'vitest';
import { discountCodeValuesSchema } from './discountCodeSchema';

const VALID_DISCOUNT_CODE_VALUES = {
    code: ' webinar-2026-09-04 ',
    percent: 25,
    startsAt: '2026-09-04T00:00:00+02:00',
    endsAt: '2026-09-04T23:59:59+02:00',
    isEnabled: true,
    placeIds: [],
    maximumUseCount: null,
};

describe('discount-code schema', () => {
    it('normalizes the code before it is stored', () => {
        const result = discountCodeValuesSchema.parse(VALID_DISCOUNT_CODE_VALUES);

        expect(result.code).toBe('WEBINAR_2026_09_04');
    });

    it('refuses a discount ending before it starts or outside a valid percentage range', () => {
        expect(
            discountCodeValuesSchema.safeParse({
                ...VALID_DISCOUNT_CODE_VALUES,
                startsAt: '2026-09-05T00:00:00+02:00',
            }).success,
        ).toBe(false);
        expect(
            discountCodeValuesSchema.safeParse({
                ...VALID_DISCOUNT_CODE_VALUES,
                percent: 101,
            }).success,
        ).toBe(false);
    });

    it('keeps every named place of a code, without repeating one', () => {
        const result = discountCodeValuesSchema.parse({
            ...VALID_DISCOUNT_CODE_VALUES,
            placeIds: [AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID, AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID],
        });

        expect(result.placeIds).toEqual([AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID]);
    });

    it('refuses a place the application does not offer at all', () => {
        expect(
            discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE_VALUES, placeIds: ['nowhere'] }).success,
        ).toBe(false);
    });

    it('refuses a use limit which no registration could ever meet', () => {
        expect(
            discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE_VALUES, maximumUseCount: 0 }).success,
        ).toBe(false);
        expect(
            discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE_VALUES, maximumUseCount: 2.5 }).success,
        ).toBe(false);
        expect(discountCodeValuesSchema.parse({ ...VALID_DISCOUNT_CODE_VALUES, maximumUseCount: 10 })).toMatchObject({
            maximumUseCount: 10,
        });
    });
});
