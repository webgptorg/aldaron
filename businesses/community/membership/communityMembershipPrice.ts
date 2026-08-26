import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import {
    COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT,
    getCommunityMembershipPlan,
    type CommunityMembershipBillingPeriod,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';

export type CommunityMembershipPrice = {
    readonly baseBillingPriceCzk: number;
    readonly discountAmountCzk: number;
    readonly finalBillingPriceCzk: number;
    readonly baseMonthlyEquivalentCzk: number;
    readonly finalMonthlyEquivalentCzk: number;
};

export function createCommunityMembershipPrice(
    planId: PaidCommunityMembershipPlanId,
    billingPeriod: CommunityMembershipBillingPeriod,
    activeDiscount: ActiveDiscount | null,
): CommunityMembershipPrice {
    const plan = getCommunityMembershipPlan(planId);
    const billedMonthCount = billingPeriod === 'yearly' ? COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT : 1;
    const baseBillingPriceCzk = billingPeriod === 'yearly' ? plan.yearlyPriceCzk : plan.monthlyPriceCzk;
    const discountAmountCzk =
        activeDiscount === null ? 0 : Math.round((baseBillingPriceCzk * activeDiscount.percent) / 100);
    const finalBillingPriceCzk = baseBillingPriceCzk - discountAmountCzk;

    return {
        baseBillingPriceCzk,
        discountAmountCzk,
        finalBillingPriceCzk,
        baseMonthlyEquivalentCzk: baseBillingPriceCzk / billedMonthCount,
        finalMonthlyEquivalentCzk: finalBillingPriceCzk / billedMonthCount,
    };
}

export function formatCommunityMembershipPrice(amountCzk: number): string {
    return `${amountCzk.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč`;
}
