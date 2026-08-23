import { describe, expect, it } from 'vitest';
import { REGISTRATION_SECTION_ID } from './discountCodeConstants';
import {
    AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
    AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
    createDiscountCodeUrl,
    DISCOUNT_PLACES,
    getDiscountCodePlaces,
    getDiscountPlaceById,
    getDiscountPlaceLabel,
    isKnownDiscountPlaceId,
} from './discountPlaces';

describe('discount places', () => {
    it('knows every place the application offers and no other', () => {
        expect(isKnownDiscountPlaceId(AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID)).toBe(true);
        expect(isKnownDiscountPlaceId('nowhere')).toBe(false);
        expect(getDiscountPlaceById('nowhere')).toBe(null);
    });

    it('names a place which is no longer offered by what is stored about it', () => {
        expect(getDiscountPlaceLabel('nowhere')).toBe('nowhere');
    });

    it('reaches every place when a code names none of them', () => {
        expect(getDiscountCodePlaces([])).toEqual(DISCOUNT_PLACES);
        expect(getDiscountCodePlaces([AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID]).map((place) => place.id)).toEqual([
            AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
        ]);
    });

    it('leaves out a stored place which the application no longer offers', () => {
        expect(getDiscountCodePlaces(['nowhere'])).toEqual([]);
    });

    it('builds a link which prefills the code and points at the registration form', () => {
        const onlineDiscountPlace = getDiscountPlaceById(AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID)!;

        expect(createDiscountCodeUrl(onlineDiscountPlace, 'WEBINAR_2026_08_20')).toBe(
            `/ai-supervize-mini?code=WEBINAR_2026_08_20#${REGISTRATION_SECTION_ID}`,
        );
    });
});
