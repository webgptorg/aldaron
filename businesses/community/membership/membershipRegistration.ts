import {
    COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT,
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    type CommunityMembershipBillingCycle,
    type CommunityMembershipPaidPlan,
} from '@/businesses/community/membership/membershipConfig';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';

export const COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME = 'CommunityMembershipRegistration';
export const COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE = 'COMMUNITY_MEMBERSHIP_REGISTRATION';
export const COMMUNITY_MEMBERSHIP_TERMS_VERSION = '2026-08-26';

export type CommunityMembershipRegistrationRequest = {
    readonly planId: string;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly fullname: string;
    readonly email: string;
    readonly discountCode: string;
    readonly termsAccepted: boolean;
};

export type StoredCommunityMembershipRegistration = {
    readonly registrationType: typeof COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE;
    readonly planId: string;
    readonly planName: string;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly trialDays: number;
    readonly termsVersion: string;
    readonly discountCodeEntered: string | null;
    readonly discountCodeUsed: string | null;
    readonly discountPercentApplied: number;
    readonly lockedMonthlyPriceCzk: number;
    readonly basePriceCzk: number;
    readonly annualDiscountPercent: number;
    readonly annualDiscountAmountCzk: number;
    readonly priceAfterAnnualDiscountCzk: number;
    readonly discountCodeAmountCzk: number;
    readonly computedFinalPriceCzk: number;
};

/** Stores only server-calculated commercial details, never prices claimed by the browser. */
export function createStoredCommunityMembershipRegistration(
    registrationRequest: CommunityMembershipRegistrationRequest,
    plan: CommunityMembershipPaidPlan,
    activeDiscount: ActiveDiscount | null,
): StoredCommunityMembershipRegistration {
    const membershipPrice = createCommunityMembershipPrice(plan, registrationRequest.billingCycle, activeDiscount);

    return {
        registrationType: COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE,
        planId: plan.id,
        planName: plan.name,
        billingCycle: registrationRequest.billingCycle,
        trialDays: COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
        termsVersion: COMMUNITY_MEMBERSHIP_TERMS_VERSION,
        discountCodeEntered: registrationRequest.discountCode.trim() || null,
        discountCodeUsed: activeDiscount?.code ?? null,
        discountPercentApplied: activeDiscount?.percent ?? 0,
        lockedMonthlyPriceCzk: plan.monthlyPriceCzk,
        basePriceCzk: membershipPrice.basePriceCzk,
        annualDiscountPercent: COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT,
        annualDiscountAmountCzk: membershipPrice.annualDiscountAmountCzk,
        priceAfterAnnualDiscountCzk: membershipPrice.priceAfterAnnualDiscountCzk,
        discountCodeAmountCzk: membershipPrice.discountCodeAmountCzk,
        computedFinalPriceCzk: membershipPrice.finalPriceCzk,
    };
}

export function createCommunityMembershipRegistrationContactNote(
    storedRegistration: StoredCommunityMembershipRegistration,
): string {
    return JSON.stringify(storedRegistration, null, 2);
}
