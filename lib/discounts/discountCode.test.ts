import { describe, expect, it } from 'vitest';
import {
    getRemainingDiscountCodeUseCount,
    isDiscountCodeActive,
    isDiscountCodeExhausted,
    isDiscountCodeNormalized,
    isDiscountCodeUsableInPlace,
    isDiscountCodeValidForAllPlaces,
    isDiscountCodeValidInPlace,
    normalizeDiscountCode,
    type DiscountCode,
} from './discountCode';

const WEBINAR_DAY = new Date('2026-08-20T12:00:00+02:00');

function createDiscountCode(values: Partial<DiscountCode> = {}): DiscountCode {
    return {
        id: '6b6863db-3fa1-4da0-85b2-0e55a33d1af0',
        code: 'WEBINAR_2026_08_20',
        percent: 25,
        startsAt: '2026-08-20T00:00:00+02:00',
        endsAt: '2026-08-20T23:59:59.999+02:00',
        isEnabled: true,
        placeIds: [],
        maximumUseCount: null,
        useCount: 0,
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
        ...values,
    };
}

describe('discount-code rules', () => {
    it('normalizes the code from a URL or manually typed input', () => {
        expect(normalizeDiscountCode(' webinar-2026-08-20 ')).toBe('WEBINAR_2026_08_20');
    });

    it('accepts only the normalized form that the database stores', () => {
        expect(isDiscountCodeNormalized('WEBINAR_2026_08_20')).toBe(true);
        expect(isDiscountCodeNormalized('webinar-2026-08-20')).toBe(false);
    });

    it('applies an enabled discount throughout its inclusive validity window', () => {
        const discountCode = createDiscountCode();

        expect(isDiscountCodeActive(discountCode, WEBINAR_DAY)).toBe(true);
        expect(isDiscountCodeActive(discountCode, new Date('2026-08-19T23:59:59+02:00'))).toBe(false);
        expect(isDiscountCodeActive(discountCode, new Date('2026-08-21T00:00:00+02:00'))).toBe(false);
    });

    it('does not apply a disabled discount even while its validity window is open', () => {
        expect(isDiscountCodeActive(createDiscountCode({ isEnabled: false }), WEBINAR_DAY)).toBe(false);
    });

    it('names no place when it is valid in every one of them', () => {
        const everywhereDiscountCode = createDiscountCode();

        expect(isDiscountCodeValidForAllPlaces(everywhereDiscountCode)).toBe(true);
        expect(isDiscountCodeValidInPlace(everywhereDiscountCode, 'any-place')).toBe(true);
    });

    it('is valid only in the places it names', () => {
        const onlinePlaceDiscountCode = createDiscountCode({ placeIds: ['ai-supervize-mini-online'] });

        expect(isDiscountCodeValidForAllPlaces(onlinePlaceDiscountCode)).toBe(false);
        expect(isDiscountCodeValidInPlace(onlinePlaceDiscountCode, 'ai-supervize-mini-online')).toBe(true);
        expect(isDiscountCodeValidInPlace(onlinePlaceDiscountCode, 'ai-supervize-mini-onsite')).toBe(false);
    });

    it('counts the uses which are left of a limited code and none of an unlimited one', () => {
        expect(getRemainingDiscountCodeUseCount(createDiscountCode())).toBe(null);
        expect(getRemainingDiscountCodeUseCount(createDiscountCode({ maximumUseCount: 10, useCount: 3 }))).toBe(7);
        expect(getRemainingDiscountCodeUseCount(createDiscountCode({ maximumUseCount: 10, useCount: 12 }))).toBe(0);
    });

    it('stops being usable once every use of it has been taken', () => {
        const exhaustedDiscountCode = createDiscountCode({ maximumUseCount: 2, useCount: 2 });

        expect(isDiscountCodeExhausted(exhaustedDiscountCode)).toBe(true);
        expect(isDiscountCodeActive(exhaustedDiscountCode, WEBINAR_DAY)).toBe(true);
        expect(isDiscountCodeUsableInPlace(exhaustedDiscountCode, 'ai-supervize-mini-online', WEBINAR_DAY)).toBe(false);
    });

    it('is usable when it is enabled, within its window, valid in the place and not used up', () => {
        const discountCode = createDiscountCode({
            placeIds: ['ai-supervize-mini-online'],
            maximumUseCount: 5,
            useCount: 4,
        });

        expect(isDiscountCodeUsableInPlace(discountCode, 'ai-supervize-mini-online', WEBINAR_DAY)).toBe(true);
        expect(isDiscountCodeUsableInPlace(discountCode, 'ai-supervize-mini-onsite', WEBINAR_DAY)).toBe(false);
    });
});
