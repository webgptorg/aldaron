import { discountCodeValuesSchema } from './discountCodeSchema';
import { describe, expect, it } from 'vitest';

const VALID_DISCOUNT_CODE = {
    code: 'webinar-2026',
    percent: 25,
    startsAt: '2026-08-20T00:00:00.000Z',
    endsAt: '2026-08-21T00:00:00.000Z',
    isEnabled: true,
    placeIds: ['ai-supervize-mini-online'],
    maximumUseCount: 10,
};

describe('discount-code write schema', () => {
    it('normalizes codes and keeps a selected place and limit', () => {
        expect(discountCodeValuesSchema.parse(VALID_DISCOUNT_CODE)).toMatchObject({
            code: 'WEBINAR_2026',
            placeIds: ['ai-supervize-mini-online'],
            maximumUseCount: 10,
        });
    });

    it('uses an empty place list for the all-places choice', () => {
        expect(discountCodeValuesSchema.parse({ ...VALID_DISCOUNT_CODE, placeIds: [], maximumUseCount: null })).toMatchObject({
            placeIds: [],
            maximumUseCount: null,
        });
    });

    it('rejects unknown places and an invalid maximum use count', () => {
        expect(
            discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE, placeIds: ['not-a-place'] }).success,
        ).toBe(false);
        expect(
            discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE, maximumUseCount: 0 }).success,
        ).toBe(false);
    });
});
