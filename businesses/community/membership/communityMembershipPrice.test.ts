import { describe, expect, it } from 'vitest';
import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
    getCommunityMembershipFeatureIds,
    getCommunityMembershipPlan,
    isCommunityMembershipBillingPeriodSupportedForPlan,
} from './communityMembershipConfig';
import { createCommunityMembershipPrice } from './communityMembershipPrice';
import {
    createStoredCommunityMembershipRegistration,
    type CommunityMembershipRegistrationRequest,
} from './communityMembershipRegistration';

const PREMIUM_YEARLY_REGISTRATION: CommunityMembershipRegistrationRequest = {
    planId: 'premium',
    billingPeriod: 'yearly',
    fullname: 'Pavol Hejný',
    email: 'pavol@example.com',
    discountCode: 'COMMUNITY_10',
    termsAccepted: true,
};

describe('community membership catalogue and prices', () => {
    it('inherits every feature from lower plans without repeating the catalogue', () => {
        expect(getCommunityMembershipFeatureIds('basic')).toHaveLength(4);
        expect(getCommunityMembershipFeatureIds('standard')).toHaveLength(10);
        expect(getCommunityMembershipFeatureIds('premium')).toHaveLength(12);
        expect(getCommunityMembershipFeatureIds('premium')).toContain('starter-repositories');
        expect(getCommunityMembershipFeatureIds('premium')).toContain('workshop-recordings');
        expect(getCommunityMembershipFeatureIds('premium')).toContain('monthly-meetups');
    });

    it('keeps the supplied yearly prices and always derives their monthly equivalent', () => {
        expect(createCommunityMembershipPrice('standard', 'yearly', null)).toEqual({
            baseBillingPriceCzk: 1_800,
            discountAmountCzk: 0,
            finalBillingPriceCzk: 1_800,
            baseMonthlyEquivalentCzk: 150,
            finalMonthlyEquivalentCzk: 150,
        });
        expect(createCommunityMembershipPrice('premium', 'yearly', null)).toEqual({
            baseBillingPriceCzk: 9_000,
            discountAmountCzk: 0,
            finalBillingPriceCzk: 9_000,
            baseMonthlyEquivalentCzk: 750,
            finalMonthlyEquivalentCzk: 750,
        });
        expect(createCommunityMembershipPrice('standard', 'monthly', null).finalBillingPriceCzk).toBe(180);
        expect(createCommunityMembershipPrice('premium', 'monthly', null).finalBillingPriceCzk).toBe(900);
    });

    it('applies a discount code after the reduced yearly price', () => {
        const price = createCommunityMembershipPrice('premium', 'yearly', {
            code: 'COMMUNITY_10',
            percent: 10,
            remainingUseCount: 4,
        });

        expect(price).toEqual({
            baseBillingPriceCzk: 9_000,
            discountAmountCzk: 900,
            finalBillingPriceCzk: 8_100,
            baseMonthlyEquivalentCzk: 750,
            finalMonthlyEquivalentCzk: 675,
        });
    });

    it('keeps the current public membership at 199 Kč per month without a yearly option', () => {
        expect(getCommunityMembershipPlan(CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID)).toMatchObject({
            id: 'membership',
            monthlyPriceCzk: CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
            yearlyPriceCzk: null,
        });
        expect(
            isCommunityMembershipBillingPeriodSupportedForPlan(CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID, 'monthly'),
        ).toBe(true);
        expect(
            isCommunityMembershipBillingPeriodSupportedForPlan(CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID, 'yearly'),
        ).toBe(false);
        expect(
            createCommunityMembershipPrice(CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID, 'monthly', null),
        ).toMatchObject({
            baseBillingPriceCzk: 199,
            finalBillingPriceCzk: 199,
            finalMonthlyEquivalentCzk: 199,
        });
        expect(
            createCommunityMembershipPrice(CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID, 'monthly', {
                code: 'COMMUNITY_10',
                percent: 10,
                remainingUseCount: null,
            }),
        ).toMatchObject({
            baseBillingPriceCzk: 199,
            discountAmountCzk: 20,
            finalBillingPriceCzk: 179,
            finalMonthlyEquivalentCzk: 179,
        });
        expect(() => createCommunityMembershipPrice(CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID, 'yearly', null)).toThrow(
            'Yearly billing is not available',
        );
    });

    it('records the exact accepted quote for the price guarantee', () => {
        expect(
            createStoredCommunityMembershipRegistration(PREMIUM_YEARLY_REGISTRATION, {
                code: 'COMMUNITY_10',
                percent: 10,
                remainingUseCount: null,
            }),
        ).toMatchObject({
            registrationType: 'COMMUNITY_MEMBERSHIP_REGISTRATION',
            status: 'trial-requested',
            planId: 'premium',
            trialDayCount: 7,
            discountCodeUsed: 'COMMUNITY_10',
            baseBillingPriceCzk: 9_000,
            discountAmountCzk: 900,
            agreedBillingPriceCzk: 8_100,
            agreedMonthlyEquivalentCzk: 675,
            priceHeldWhileMembershipContinues: true,
        });

        expect(createStoredCommunityMembershipRegistration(PREMIUM_YEARLY_REGISTRATION, null)).toMatchObject({
            agreedBillingPriceCzk: 9_000,
        });
    });

    it('records the current public membership as a monthly payment request without a trial', () => {
        expect(
            createStoredCommunityMembershipRegistration(
                {
                    planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
                    billingPeriod: 'monthly',
                    fullname: 'Pavol Hejný',
                    email: 'pavol@example.com',
                    discountCode: '',
                    termsAccepted: true,
                },
                null,
            ),
        ).toMatchObject({
            status: 'payment-requested',
            planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
            billingPeriod: 'monthly',
            trialDayCount: null,
            agreedBillingPriceCzk: 199,
            agreedMonthlyEquivalentCzk: 199,
        });
    });
});
