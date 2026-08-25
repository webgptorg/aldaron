import {
    AI_SUPERVIZE_MINI_PATH,
    COMMUNITY_PREMIUM_DISCOUNT_PLACE_ID,
    COMMUNITY_PREMIUM_PLUS_DISCOUNT_PLACE_ID,
    DISCOUNT_PLACES,
    createDiscountCodePrefillPath,
    createDiscountCodeUrl,
    getDiscountCodePlaces,
} from './discountPlaces';
import { COMMUNITY_MEMBERSHIP_PATH } from '@/businesses/community/config';
import { describe, expect, it } from 'vitest';

describe('discount-place links', () => {
    it('builds the shared prefill-and-registration URL pattern', () => {
        expect(createDiscountCodeUrl(DISCOUNT_PLACES[0]!, 'WEBINAR 2026')).toBe(
            `${AI_SUPERVIZE_MINI_PATH}?code=WEBINAR%202026#registrace`,
        );
        expect(createDiscountCodePrefillPath('/paid-offer', 'registration', 'SAVE/10')).toBe(
            '/paid-offer?code=SAVE%2F10#registration',
        );
    });

    it('expands all places and preserves only known selected places', () => {
        expect(getDiscountCodePlaces([])).toEqual(DISCOUNT_PLACES);
        expect(getDiscountCodePlaces(['ai-supervize-mini-online', 'unknown-place'])).toEqual([
            DISCOUNT_PLACES[1],
        ]);
    });

    it('offers separate, shareable code links for the two paid community tiers', () => {
        expect(getDiscountCodePlaces([COMMUNITY_PREMIUM_DISCOUNT_PLACE_ID, COMMUNITY_PREMIUM_PLUS_DISCOUNT_PLACE_ID])).toEqual([
            DISCOUNT_PLACES[2],
            DISCOUNT_PLACES[3],
        ]);
        expect(createDiscountCodeUrl(DISCOUNT_PLACES[2]!, 'KOMUNITA 25')).toBe(
            `${COMMUNITY_MEMBERSHIP_PATH}?code=KOMUNITA%2025#registrace`,
        );
    });
});
