import {
    COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT,
    COMMUNITY_MEMBERSHIP_TRIAL_DAYS,
    createCommunityMembershipPrice,
    type CommunityMembershipBillingCycle,
    type CommunityMembershipPaidPlan,
} from '@/businesses/community/membership/membershipConfig';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';

/** Stable source label shown in the contacts administration. */
export const COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME = 'CommunityMembershipRegistration';
export const COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE = 'COMMUNITY_MEMBERSHIP_REGISTRATION';

export type CommunityMembershipRegistrationRequest = {
    readonly planId: string;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly fullname: string;
    readonly email: string;
    readonly discountCode: string;
};

export type StoredCommunityMembershipRegistration = {
    readonly registrationType: typeof COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE;
    readonly planId: string;
    readonly planName: string;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly trialDays: number;
    readonly discountCodeEntered: string | null;
    readonly discountCodeUsed: string | null;
    readonly discountPercentApplied: number;
    readonly monthlyPriceCzk: number;
    readonly basePriceCzk: number;
    readonly annualDiscountPercent: number;
    readonly annualDiscountAmountCzk: number;
    readonly priceAfterAnnualDiscountCzk: number;
    readonly discountCodeAmountCzk: number;
    readonly computedFinalPriceCzk: number;
};

/**
 * The record sent to the contact dashboard holds the server-calculated quote, not a browser
 * estimate. This lets the membership team honour the selected annual and code discounts later.
 */
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
        discountCodeEntered: registrationRequest.discountCode.trim() || null,
        discountCodeUsed: activeDiscount?.code ?? null,
        discountPercentApplied: activeDiscount?.percent ?? 0,
        monthlyPriceCzk: plan.monthlyPriceCzk,
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
