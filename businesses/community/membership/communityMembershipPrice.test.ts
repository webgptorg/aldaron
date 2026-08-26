import { describe, expect, it } from 'vitest';
import { getCommunityMembershipFeatureIds } from './communityMembershipConfig';
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
});
