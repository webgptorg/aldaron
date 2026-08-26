import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import { describe, expect, it } from 'vitest';
import {
    COMMUNITY_MEMBERSHIP_PAID_PLANS,
    COMMUNITY_MEMBERSHIP_PLANS,
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    getCommunityMembershipMonthlyEquivalent,
    getCommunityMembershipPaidPlan,
    getInitialCommunityMembershipPaidPlanId,
} from './membershipConfig';

const ACTIVE_DISCOUNT: ActiveDiscount = { code: 'KOMUNITA25', percent: 25, remainingUseCount: null };

describe('community membership catalogue and pricing', () => {
    it('keeps the requested plan names, prices and seven-day trial in one catalogue', () => {
        expect(COMMUNITY_MEMBERSHIP_PLANS.map(({ id, monthlyPriceCzk }) => ({ id, monthlyPriceCzk }))).toEqual([
            { id: 'basic', monthlyPriceCzk: 0 },
            { id: 'standard', monthlyPriceCzk: 150 },
            { id: 'premium', monthlyPriceCzk: 1000 },
        ]);
        expect(COMMUNITY_MEMBERSHIP_PAID_PLANS.map((plan) => plan.id)).toEqual(['standard', 'premium']);
        expect(COMMUNITY_MEMBERSHIP_TRIAL_DAYS).toBe(7);
    });

    it('makes every higher plan a strict superset of the lower plan', () => {
        const [basic, standard, premium] = COMMUNITY_MEMBERSHIP_PLANS;

        expect(basic!.featureIds.every((featureId) => standard!.featureIds.includes(featureId))).toBe(true);
        expect(standard!.featureIds.every((featureId) => premium!.featureIds.includes(featureId))).toBe(true);
        expect(new Set(standard!.featureIds).size).toBeGreaterThan(new Set(basic!.featureIds).size);
        expect(new Set(premium!.featureIds).size).toBeGreaterThan(new Set(standard!.featureIds).size);
    });

    it('applies the annual reduction and then the code while retaining a monthly equivalent', () => {
        const standard = getCommunityMembershipPaidPlan('standard')!;
        const price = createCommunityMembershipPrice(standard, 'yearly', ACTIVE_DISCOUNT);

        expect(price).toEqual({
            basePriceCzk: 1800,
            annualDiscountAmountCzk: 360,
            priceAfterAnnualDiscountCzk: 1440,
            discountCodePercent: 25,
            discountCodeAmountCzk: 360,
            finalPriceCzk: 1080,
        });
        expect(getCommunityMembershipMonthlyEquivalent(price, 'yearly')).toBe(90);
    });

    it('does not invent an annual reduction for monthly Premium billing', () => {
        expect(
            createCommunityMembershipPrice(getCommunityMembershipPaidPlan('premium')!, 'monthly', ACTIVE_DISCOUNT),
        ).toEqual({
            basePriceCzk: 1000,
            annualDiscountAmountCzk: 0,
            priceAfterAnnualDiscountCzk: 1000,
            discountCodePercent: 25,
            discountCodeAmountCzk: 250,
            finalPriceCzk: 750,
        });
    });

    it('opens the only paid plan where a generated discount link is usable', () => {
        expect(
            getInitialCommunityMembershipPaidPlanId({
                'community-standard': ACTIVE_DISCOUNT,
                'community-premium': null,
            }),
        ).toBe('standard');
        expect(
            getInitialCommunityMembershipPaidPlanId({
                'community-standard': null,
                'community-premium': ACTIVE_DISCOUNT,
            }),
        ).toBe('premium');
        expect(
            getInitialCommunityMembershipPaidPlanId({
                'community-standard': ACTIVE_DISCOUNT,
                'community-premium': ACTIVE_DISCOUNT,
            }),
        ).toBe('premium');
    });
});
