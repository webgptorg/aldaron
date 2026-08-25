import {
    COMMUNITY_MEMBERSHIP_PAID_PLANS,
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    getCommunityMembershipPaidPlan,
} from './membershipConfig';
import { describe, expect, it } from 'vitest';

const ACTIVE_DISCOUNT = { code: 'KOMUNITA25', percent: 25, remainingUseCount: null } as const;

describe('community membership pricing', () => {
    it('keeps Premium at 150 Kč per month and takes the annual and code discounts in sequence', () => {
        const premiumPlan = getCommunityMembershipPaidPlan('premium');

        expect(premiumPlan).not.toBeNull();
        expect(premiumPlan?.monthlyPriceCzk).toBe(150);
        expect(createCommunityMembershipPrice(premiumPlan!, 'yearly', ACTIVE_DISCOUNT)).toEqual({
            basePriceCzk: 1800,
            annualDiscountAmountCzk: 360,
            priceAfterAnnualDiscountCzk: 1440,
            discountCodePercent: 25,
            discountCodeAmountCzk: 360,
            finalPriceCzk: 1080,
        });
    });

    it('applies a code to the monthly price without inventing an annual discount', () => {
        const premiumPlusPlan = getCommunityMembershipPaidPlan('premium-plus');

        expect(premiumPlusPlan?.monthlyPriceCzk).toBe(1000);
        expect(createCommunityMembershipPrice(premiumPlusPlan!, 'monthly', ACTIVE_DISCOUNT)).toEqual({
            basePriceCzk: 1000,
            annualDiscountAmountCzk: 0,
            priceAfterAnnualDiscountCzk: 1000,
            discountCodePercent: 25,
            discountCodeAmountCzk: 250,
            finalPriceCzk: 750,
        });
    });

    it('keeps Free out of the paid registration path and gives both paid plans the same trial length', () => {
        expect(getCommunityMembershipPaidPlan('free')).toBeNull();
        expect(COMMUNITY_MEMBERSHIP_PAID_PLANS.map((plan) => plan.id)).toEqual(['premium', 'premium-plus']);
        expect(COMMUNITY_MEMBERSHIP_TRIAL_DAYS).toBe(7);
    });
});
