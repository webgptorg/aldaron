import type { ActiveDiscount, ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import {
    COMMUNITY_PREMIUM_DISCOUNT_PLACE_ID,
    COMMUNITY_STANDARD_DISCOUNT_PLACE_ID,
} from '@/lib/discounts/discountPlaces';

export const COMMUNITY_MEMBERSHIP_TRIAL_DAYS = 7;
export const COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT = 20;
export const COMMUNITY_MEMBERSHIP_DEFAULT_BILLING_CYCLE = 'yearly' as const;

export type CommunityMembershipBillingCycle = 'monthly' | 'yearly';
export type CommunityMembershipPlanId = 'basic' | 'standard' | 'premium';
export type CommunityMembershipPaidPlanId = Exclude<CommunityMembershipPlanId, 'basic'>;

export type CommunityMembershipFeatureId =
    | 'live-workshops'
    | 'community-materials'
    | 'starter-repositories'
    | 'member-discussion'
    | 'paid-discord'
    | 'workshop-recordings'
    | 'exclusive-content'
    | 'share-creations'
    | 'priority-questions'
    | 'materials-rss'
    | 'monthly-meetups'
    | 'premium-priority';

export type CommunityMembershipFeature = {
    readonly id: CommunityMembershipFeatureId;
    readonly label: string;
    readonly description: string;
};

/** Every benefit is written once and reused by cards and the comparison table. */
export const COMMUNITY_MEMBERSHIP_FEATURES: readonly CommunityMembershipFeature[] = [
    {
        id: 'live-workshops',
        label: 'Pozvánky na živé workshopy',
        description: 'Připojíte se zdarma online a odnesete si ucelené téma během jedné hodiny.',
    },
    {
        id: 'community-materials',
        label: 'Materiály komunity',
        description: 'Praktické návody, checklisty a odkazy z komunitní místnosti.',
    },
    {
        id: 'starter-repositories',
        label: 'Starter repozitáře',
        description: 'Funkční základy projektů, na kterých můžete rovnou stavět.',
    },
    {
        id: 'member-discussion',
        label: 'Diskuze s ostatními členy',
        description: 'Prostor pro otázky, zkušenosti a konkrétní zpětnou vazbu.',
    },
    {
        id: 'paid-discord',
        label: 'Discord pro platící členy',
        description: 'Rychlejší každodenní kontakt s lidmi, kteří tvoří produkty a firmy.',
    },
    {
        id: 'workshop-recordings',
        label: 'Všechny záznamy workshopů',
        description: 'Včetně chystaných deep dives do Gitu, databází, testů a práce s kontextem.',
    },
    {
        id: 'exclusive-content',
        label: 'Exkluzivní obsah',
        description: 'Obsah do hloubky, který ve veřejné části komunity nenajdete.',
    },
    {
        id: 'share-creations',
        label: 'Sdílení vlastních výtvorů',
        description: 'Ukažte rozpracovaný produkt, workflow nebo obsah a získejte odezvu.',
    },
    {
        id: 'priority-questions',
        label: 'Přednostní otázky na workshopech',
        description: 'Otázku můžete poslat předem a během workshopu dostane více prostoru.',
    },
    {
        id: 'materials-rss',
        label: 'RSS kanál s materiály',
        description: 'Nový obsah vám přijde do čtečky bez dalšího algoritmického feedu.',
    },
    {
        id: 'monthly-meetups',
        label: 'Měsíční setkání naživo',
        description: 'Jednou měsíčně osobní networking a diskuze nad tím, co právě stavíte.',
    },
    {
        id: 'premium-priority',
        label: 'Nejvyšší priorita v diskuzi',
        description: 'Více prostoru ovlivnit témata materiálů a dostat podrobnou odpověď.',
    },
];

const BASIC_FEATURE_IDS: readonly CommunityMembershipFeatureId[] = [
    'live-workshops',
    'community-materials',
    'starter-repositories',
    'member-discussion',
];

const STANDARD_FEATURE_IDS: readonly CommunityMembershipFeatureId[] = [
    ...BASIC_FEATURE_IDS,
    'paid-discord',
    'workshop-recordings',
    'exclusive-content',
    'share-creations',
    'priority-questions',
    'materials-rss',
];

const PREMIUM_FEATURE_IDS: readonly CommunityMembershipFeatureId[] = [
    ...STANDARD_FEATURE_IDS,
    'monthly-meetups',
    'premium-priority',
];

export type CommunityMembershipPlan = {
    readonly id: CommunityMembershipPlanId;
    readonly name: string;
    readonly eyebrow: string;
    readonly description: string;
    readonly monthlyPriceCzk: number;
    readonly discountPlaceId: string | null;
    readonly featureIds: readonly CommunityMembershipFeatureId[];
    readonly highlightedFeatureIds: readonly CommunityMembershipFeatureId[];
    readonly isFeatured: boolean;
};

/**
 * The page and registration endpoint share one catalogue, so prices, inherited benefits and
 * discount-code places cannot drift apart.
 */
export const COMMUNITY_MEMBERSHIP_PLANS: readonly CommunityMembershipPlan[] = [
    {
        id: 'basic',
        name: 'Basic',
        eyebrow: 'Začněte zdarma',
        description: 'Pro každého, kdo chce sledovat komunitu a chodit na živé workshopy.',
        monthlyPriceCzk: 0,
        discountPlaceId: null,
        featureIds: BASIC_FEATURE_IDS,
        highlightedFeatureIds: BASIC_FEATURE_IDS,
        isFeatured: false,
    },
    {
        id: 'standard',
        name: 'Standard',
        eyebrow: 'Všechny záznamy',
        description: 'Pro vývojáře a tvůrce, kteří chtějí pravidelný přísun praxe a zpětné vazby.',
        monthlyPriceCzk: 150,
        discountPlaceId: COMMUNITY_STANDARD_DISCOUNT_PLACE_ID,
        featureIds: STANDARD_FEATURE_IDS,
        highlightedFeatureIds: ['workshop-recordings', 'paid-discord', 'exclusive-content', 'priority-questions'],
        isFeatured: false,
    },
    {
        id: 'premium',
        name: 'Premium',
        eyebrow: 'Nejblíž komunitě',
        description: 'Pro ty, kdo chtějí být u důležitých debat osobně a mít nejvyšší prioritu.',
        monthlyPriceCzk: 1000,
        discountPlaceId: COMMUNITY_PREMIUM_DISCOUNT_PLACE_ID,
        featureIds: PREMIUM_FEATURE_IDS,
        highlightedFeatureIds: ['monthly-meetups', 'premium-priority', 'workshop-recordings', 'paid-discord'],
        isFeatured: true,
    },
];

export type CommunityMembershipPaidPlan = CommunityMembershipPlan & {
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

export function getCommunityMembershipFeature(featureId: CommunityMembershipFeatureId): CommunityMembershipFeature {
    const feature = COMMUNITY_MEMBERSHIP_FEATURES.find((candidate) => candidate.id === featureId);

    if (feature === undefined) {
        throw new Error(`Unknown community membership feature: ${featureId}`);
    }

    return feature;
}

export function getCommunityMembershipPlan(planId: string): CommunityMembershipPlan | null {
    return COMMUNITY_MEMBERSHIP_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function isCommunityMembershipPaidPlan(plan: CommunityMembershipPlan): plan is CommunityMembershipPaidPlan {
    return plan.id !== 'basic' && plan.discountPlaceId !== null;
}

export function getCommunityMembershipPaidPlan(planId: string): CommunityMembershipPaidPlan | null {
    const plan = getCommunityMembershipPlan(planId);

    return plan !== null && isCommunityMembershipPaidPlan(plan) ? plan : null;
}

export const COMMUNITY_MEMBERSHIP_PAID_PLANS = COMMUNITY_MEMBERSHIP_PLANS.filter(isCommunityMembershipPaidPlan);

/**
 * A generated discount link does not carry a plan ID because both paid plans share one landing page. If its code is
 * usable for exactly one paid plan, open that plan automatically; otherwise preserve the page's Premium focus.
 */
export function getInitialCommunityMembershipPaidPlanId(
    activeDiscountByPlaceId: ActiveDiscountByPlaceId,
): CommunityMembershipPaidPlanId {
    const discountedPlans = COMMUNITY_MEMBERSHIP_PAID_PLANS.filter((plan) => {
        const activeDiscount = activeDiscountByPlaceId[plan.discountPlaceId];
        return activeDiscount !== null && activeDiscount !== undefined;
    });

    return discountedPlans.length === 1 ? discountedPlans[0]!.id : 'premium';
}

/** The annual reduction is applied first; a valid code then reduces that already lower price. */
export function createCommunityMembershipPrice(
    plan: CommunityMembershipPaidPlan,
    billingCycle: CommunityMembershipBillingCycle,
    activeDiscount: ActiveDiscount | null,
): CommunityMembershipPrice {
    const basePriceCzk = plan.monthlyPriceCzk * (billingCycle === 'yearly' ? 12 : 1);
    const annualDiscountAmountCzk =
        billingCycle === 'yearly' ? Math.round((basePriceCzk * COMMUNITY_MEMBERSHIP_ANNUAL_DISCOUNT_PERCENT) / 100) : 0;
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

export function getCommunityMembershipMonthlyEquivalent(
    price: CommunityMembershipPrice,
    billingCycle: CommunityMembershipBillingCycle,
): number {
    return price.finalPriceCzk / (billingCycle === 'yearly' ? 12 : 1);
}

export function formatCommunityMembershipPrice(amountCzk: number): string {
    return `${amountCzk.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} Kč`;
}
