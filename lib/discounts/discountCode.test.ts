import {
    createActiveDiscount,
    getRemainingDiscountCodeUseCount,
    isDiscountCodeActive,
    isDiscountCodeExhausted,
    isDiscountCodeValidForAllPlaces,
    isDiscountCodeValidInPlace,
    isDiscountCodeUsableInPlace,
    normalizeDiscountCode,
    type DiscountCode,
} from './discountCode';
import { describe, expect, it } from 'vitest';

const CURRENT_DATE = new Date('2026-08-20T12:00:00.000Z');

function createDiscountCode(overrides: Partial<DiscountCode> = {}): DiscountCode {
    return {
        id: '00000000-0000-0000-0000-000000000001',
        code: 'WEBINAR_2026',
        percent: 25,
        startsAt: '2026-08-20T00:00:00.000Z',
        endsAt: '2026-08-21T00:00:00.000Z',
        isEnabled: true,
        placeIds: [],
        maximumUseCount: null,
        useCount: 0,
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
        ...overrides,
    };
}

describe('shared discount-code rules', () => {
    it('normalizes user-entered codes to the database representation', () => {
        expect(normalizeDiscountCode('  webinar-2026/08  ')).toBe('WEBINAR_2026_08');
    });

    it('treats an empty place list as every place and a non-empty list as specific places', () => {
        const allPlacesDiscountCode = createDiscountCode();
        const selectedPlacesDiscountCode = createDiscountCode({ placeIds: ['ai-supervize-mini-online'] });

        expect(isDiscountCodeValidForAllPlaces(allPlacesDiscountCode)).toBe(true);
        expect(isDiscountCodeValidInPlace(allPlacesDiscountCode, 'new-place')).toBe(true);
        expect(isDiscountCodeValidForAllPlaces(selectedPlacesDiscountCode)).toBe(false);
        expect(isDiscountCodeValidInPlace(selectedPlacesDiscountCode, 'ai-supervize-mini-online')).toBe(true);
        expect(isDiscountCodeValidInPlace(selectedPlacesDiscountCode, 'ai-supervize-mini-onsite')).toBe(false);
    });

    it('exposes the remaining uses and makes exhaustion part of usability', () => {
        const limitedDiscountCode = createDiscountCode({ maximumUseCount: 5, useCount: 3 });
        const exhaustedDiscountCode = createDiscountCode({ maximumUseCount: 5, useCount: 5 });

        expect(getRemainingDiscountCodeUseCount(limitedDiscountCode)).toBe(2);
        expect(isDiscountCodeExhausted(limitedDiscountCode)).toBe(false);
        expect(isDiscountCodeExhausted(exhaustedDiscountCode)).toBe(true);
        expect(isDiscountCodeUsableInPlace(limitedDiscountCode, 'ai-supervize-mini-onsite', CURRENT_DATE)).toBe(true);
        expect(isDiscountCodeUsableInPlace(exhaustedDiscountCode, 'ai-supervize-mini-onsite', CURRENT_DATE)).toBe(false);
        expect(createActiveDiscount(limitedDiscountCode)).toMatchObject({
            code: 'WEBINAR_2026',
            percent: 25,
            remainingUseCount: 2,
        });
    });

    it('requires the code to be enabled and inside its validity window', () => {
        expect(isDiscountCodeActive(createDiscountCode(), CURRENT_DATE)).toBe(true);
        expect(
            isDiscountCodeActive(createDiscountCode({ isEnabled: false }), CURRENT_DATE),
        ).toBe(false);
        expect(
            isDiscountCodeActive(
                createDiscountCode({ startsAt: '2026-08-21T00:00:00.000Z' }),
                CURRENT_DATE,
            ),
        ).toBe(false);
    });
});
