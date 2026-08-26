import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import {
    COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE,
    COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT,
    getCommunityMembershipPlan,
    type CommunityMembershipBillingPeriod,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';
import { createCommunityMembershipPrice, type CommunityMembershipPrice } from './communityMembershipPrice';

export type CommunityMembershipRegistrationRequest = {
    readonly planId: PaidCommunityMembershipPlanId;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly fullname: string;
    readonly email: string;
    readonly discountCode: string;
    readonly termsAccepted: boolean;
};

export type StoredCommunityMembershipRegistration = {
    readonly registrationType: typeof COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE;
    readonly membership: 'Komunita Promptbooku';
    readonly status: 'trial-requested';
    readonly planId: PaidCommunityMembershipPlanId;
    readonly planName: string;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly trialDayCount: typeof COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT;
    readonly discountCodeEntered: string | null;
    readonly discountCodeUsed: string | null;
    readonly discountPercentApplied: number;
    readonly baseBillingPriceCzk: number;
    readonly discountAmountCzk: number;
    readonly agreedBillingPriceCzk: number;
    readonly agreedMonthlyEquivalentCzk: number;
    readonly priceHeldWhileMembershipContinues: true;
    readonly termsAccepted: true;
};

export type CommunityMembershipRegistrationResult = {
    readonly planId: PaidCommunityMembershipPlanId;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly price: CommunityMembershipPrice;
    readonly activeDiscount: ActiveDiscount | null;
    readonly trialDayCount: typeof COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT;
};

/**
 * Captures the exact commercial offer accepted with the registration. Until a payment provider exists, this Contact
 * payload is the durable price-lock record used when the activation is confirmed by e-mail.
 */
export function createStoredCommunityMembershipRegistration(
    registrationRequest: CommunityMembershipRegistrationRequest,
    activeDiscount: ActiveDiscount | null,
): StoredCommunityMembershipRegistration {
    const plan = getCommunityMembershipPlan(registrationRequest.planId);
    const price = createCommunityMembershipPrice(
        registrationRequest.planId,
        registrationRequest.billingPeriod,
        activeDiscount,
    );

    return {
        registrationType: COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE,
        membership: 'Komunita Promptbooku',
        status: 'trial-requested',
        planId: registrationRequest.planId,
        planName: plan.name,
        billingPeriod: registrationRequest.billingPeriod,
        trialDayCount: COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT,
        discountCodeEntered: registrationRequest.discountCode.trim() || null,
        discountCodeUsed: activeDiscount?.code ?? null,
        discountPercentApplied: activeDiscount?.percent ?? 0,
        baseBillingPriceCzk: price.baseBillingPriceCzk,
        discountAmountCzk: price.discountAmountCzk,
        agreedBillingPriceCzk: price.finalBillingPriceCzk,
        agreedMonthlyEquivalentCzk: price.finalMonthlyEquivalentCzk,
        priceHeldWhileMembershipContinues: true,
        termsAccepted: true,
    };
}

export function createCommunityMembershipRegistrationContactNote(
    storedRegistration: StoredCommunityMembershipRegistration,
): string {
    return JSON.stringify(storedRegistration, null, 2);
}

export function createCommunityMembershipRegistrationResult(
    registrationRequest: CommunityMembershipRegistrationRequest,
    activeDiscount: ActiveDiscount | null,
): CommunityMembershipRegistrationResult {
    return {
        planId: registrationRequest.planId,
        billingPeriod: registrationRequest.billingPeriod,
        price: createCommunityMembershipPrice(
            registrationRequest.planId,
            registrationRequest.billingPeriod,
            activeDiscount,
        ),
        activeDiscount,
        trialDayCount: COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT,
    };
}
