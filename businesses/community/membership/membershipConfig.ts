import {
    COMMUNITY_PREMIUM_DISCOUNT_PLACE_ID,
    COMMUNITY_PREMIUM_PLUS_DISCOUNT_PLACE_ID,
} from '@/lib/discounts/discountPlaces';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';

export const COMMUNITY_MEMBERSHIP_TRIAL_DAYS = 7;
export const COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT = 20;

export type CommunityMembershipPlanId = 'free' | 'premium' | 'premium-plus';
export type CommunityMembershipPaidPlanId = Exclude<CommunityMembershipPlanId, 'free'>;
export type CommunityMembershipBillingCycle = 'monthly' | 'yearly';

export type CommunityMembershipPlan = {
    readonly id: CommunityMembershipPlanId;
    readonly name: string;
    readonly description: string;
    readonly monthlyPriceCzk: number;
    readonly discountPlaceId: string | null;
    readonly features: readonly string[];
    readonly isRecommended: boolean;
};

/**
 * The public pricing cards and the registration endpoint share this one catalogue. It keeps a
 * plan's price, benefits and discount-code place from drifting apart as membership evolves.
 */
export const COMMUNITY_MEMBERSHIP_PLANS = [
    {
        id: 'free',
        name: 'Free',
        description: 'Základní přístup pro každého, kdo chce zůstat ve spojení.',
        monthlyPriceCzk: 0,
        discountPlaceId: null,
        features: ['Přístup do komunitní místnosti', 'Veřejné materiály a oznámení', 'Přehled publikovaných workshopů'],
        isRecommended: false,
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'Praktický rytmus pro lidi, kteří chtějí z AI dostat víc každý měsíc.',
        monthlyPriceCzk: 150,
        discountPlaceId: COMMUNITY_PREMIUM_DISCOUNT_PLACE_ID,
        features: [
            'Exkluzivní obsah, návody a záznamy',
            'Členské workshopy a praktické Q&A',
            'Networking s lidmi, kteří AI opravdu používají',
            'Přístup k novým komunitním materiálům jako první',
        ],
        isRecommended: true,
    },
    {
        id: 'premium-plus',
        name: 'Premium+',
        description: 'Pro ty, kdo chtějí osobní zpětnou vazbu a náskok před ostatními.',
        monthlyPriceCzk: 1000,
        discountPlaceId: COMMUNITY_PREMIUM_PLUS_DISCOUNT_PLACE_ID,
        features: [
            'Vše z Premium',
            'Individuální 1:1 konzultace',
            'Přednostní přístup k novým funkcím',
            'Více prostoru pro konkrétní otázky a zpětnou vazbu',
        ],
        isRecommended: false,
    },
] as const satisfies readonly CommunityMembershipPlan[];

export type CommunityMembershipPaidPlan = (typeof COMMUNITY_MEMBERSHIP_PLANS)[number] & {
    readonly id: CommunityMembershipPaidPlanId;
    readonly discountPlaceId: string;
};

export type CommunityMembershipPrice = {
    readonly basePriceCzk: number;
    readonly annualDiscountAmountCzk: number;
    readonly priceAfterAnnualDiscountCzk: number;
    readonly discountCodePercent: number;
    readonly discountCodeAmountCzk: number;
    readonly finalPriceCzk: number;
};

export function getCommunityMembershipPlan(planId: string): CommunityMembershipPlan | null {
    return COMMUNITY_MEMBERSHIP_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function isCommunityMembershipPaidPlan(
    plan: CommunityMembershipPlan,
): plan is CommunityMembershipPaidPlan {
    return plan.id !== 'free' && plan.discountPlaceId !== null;
}

export function getCommunityMembershipPaidPlan(planId: string): CommunityMembershipPaidPlan | null {
    const plan = getCommunityMembershipPlan(planId);

    return plan !== null && isCommunityMembershipPaidPlan(plan) ? plan : null;
}

export const COMMUNITY_MEMBERSHIP_PAID_PLANS = COMMUNITY_MEMBERSHIP_PLANS.filter(isCommunityMembershipPaidPlan);

/**
 * Calculates the same quote in the browser and on the server. A yearly payment first receives
 * its permanent 20% reduction; an eligible discount code then applies to that already reduced price.
 */
export function createCommunityMembershipPrice(
    plan: CommunityMembershipPaidPlan,
    billingCycle: CommunityMembershipBillingCycle,
    activeDiscount: ActiveDiscount | null,
): CommunityMembershipPrice {
    const basePriceCzk = plan.monthlyPriceCzk * (billingCycle === 'yearly' ? 12 : 1);
    const annualDiscountAmountCzk =
        billingCycle === 'yearly'
            ? Math.round((basePriceCzk * COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT) / 100)
            : 0;
    const priceAfterAnnualDiscountCzk = basePriceCzk - annualDiscountAmountCzk;
    const discountCodePercent = activeDiscount?.percent ?? 0;
    const discountCodeAmountCzk = Math.round((priceAfterAnnualDiscountCzk * discountCodePercent) / 100);

    return {
        basePriceCzk,
        annualDiscountAmountCzk,
        priceAfterAnnualDiscountCzk,
        discountCodePercent,
        discountCodeAmountCzk,
        finalPriceCzk: priceAfterAnnualDiscountCzk - discountCodeAmountCzk,
    };
}

export function formatCommunityMembershipPrice(amountCzk: number): string {
    return `${amountCzk.toLocaleString('cs-CZ')} Kč`;
}
