import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID, COMMUNITY_MEMBERSHIP_PATH } from '@/lib/discounts/discountPlaces';

export type CommunityMembershipPlanId = 'basic' | 'standard' | 'premium';
export type PaidCommunityMembershipPlanId = Exclude<CommunityMembershipPlanId, 'basic'>;
export type CommunityMembershipBillingPeriod = 'monthly' | 'yearly';

export type CommunityMembershipPlan = {
    readonly id: CommunityMembershipPlanId;
    readonly name: string;
    readonly description: string;
    readonly monthlyPriceCzk: number;
    readonly yearlyPriceCzk: number;
    readonly addedFeatureIds: readonly CommunityMembershipFeatureId[];
};

export type CommunityMembershipFeatureId =
    | 'live-workshops'
    | 'community-materials'
    | 'starter-repositories'
    | 'member-discussion'
    | 'paid-discord'
    | 'workshop-recordings'
    | 'exclusive-content'
    | 'creation-showcase'
    | 'workshop-question-priority'
    | 'materials-rss'
    | 'monthly-meetups'
    | 'premium-priority';

export type CommunityMembershipFeature = {
    readonly id: CommunityMembershipFeatureId;
    readonly label: string;
    readonly shortLabel: string;
};

export const COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT = 7;
export const COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT = 12;
export const COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT = 2;
const COMMUNITY_MEMBERSHIP_YEARLY_CHARGED_MONTH_COUNT =
    COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT - COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT;
export const COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE = 'COMMUNITY_MEMBERSHIP_REGISTRATION';
export const COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME = 'CommunityMembershipRegistration';
export const COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH = '/api/community/membership/registration';
export { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID, COMMUNITY_MEMBERSHIP_PATH };

export const COMMUNITY_MEMBERSHIP_FEATURES: readonly CommunityMembershipFeature[] = [
    { id: 'live-workshops', label: 'Pozvánky na živé online workshopy', shortLabel: 'Živé workshopy' },
    { id: 'community-materials', label: 'Materiály komunity', shortLabel: 'Materiály komunity' },
    { id: 'starter-repositories', label: 'Startovací repozitáře', shortLabel: 'Starter repozitáře' },
    { id: 'member-discussion', label: 'Diskuze s ostatními členy', shortLabel: 'Komunitní diskuze' },
    { id: 'paid-discord', label: 'Discord pro platící členy', shortLabel: 'Členský Discord' },
    { id: 'workshop-recordings', label: 'Všechny záznamy workshopů', shortLabel: 'Záznamy workshopů' },
    { id: 'exclusive-content', label: 'Exkluzivní obsah a praktické návody', shortLabel: 'Exkluzivní obsah' },
    { id: 'creation-showcase', label: 'Prostor sdílet vlastní tvorbu', shortLabel: 'Sdílení vlastní tvorby' },
    {
        id: 'workshop-question-priority',
        label: 'Přednostní dotazy před workshopem i během něj',
        shortLabel: 'Přednostní dotazy',
    },
    { id: 'materials-rss', label: 'Soukromý RSS kanál s materiály', shortLabel: 'RSS s materiály' },
    { id: 'monthly-meetups', label: 'Pozvánka na osobní setkání každý měsíc', shortLabel: 'Měsíční setkání' },
    {
        id: 'premium-priority',
        label: 'Nejvyšší priorita u materiálů a zapojení do diskuze',
        shortLabel: 'Premium priorita',
    },
];

export const COMMUNITY_MEMBERSHIP_PLANS: readonly CommunityMembershipPlan[] = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Pro vstup do komunity a účast na živých workshopech.',
        monthlyPriceCzk: 0,
        yearlyPriceCzk: 0,
        addedFeatureIds: ['live-workshops', 'community-materials', 'starter-repositories', 'member-discussion'],
    },
    {
        id: 'standard',
        name: 'Standard',
        description: 'Pro pravidelné učení, záznamy a sdílení vlastní práce.',
        monthlyPriceCzk: 180,
        yearlyPriceCzk: 180 * COMMUNITY_MEMBERSHIP_YEARLY_CHARGED_MONTH_COUNT,
        addedFeatureIds: [
            'paid-discord',
            'workshop-recordings',
            'exclusive-content',
            'creation-showcase',
            'workshop-question-priority',
            'materials-rss',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'Pro ty, kdo chtějí být komunitě blíž a potkávat se i osobně.',
        monthlyPriceCzk: 900,
        yearlyPriceCzk: 900 * COMMUNITY_MEMBERSHIP_YEARLY_CHARGED_MONTH_COUNT,
        addedFeatureIds: ['monthly-meetups', 'premium-priority'],
    },
];

export function getCommunityMembershipPlan(planId: CommunityMembershipPlanId): CommunityMembershipPlan {
    const plan = COMMUNITY_MEMBERSHIP_PLANS.find((candidate) => candidate.id === planId);

    if (plan === undefined) {
        throw new Error(`Unknown community membership plan: ${planId}`);
    }

    return plan;
}

export function isPaidCommunityMembershipPlanId(value: unknown): value is PaidCommunityMembershipPlanId {
    return value === 'standard' || value === 'premium';
}

export function isCommunityMembershipBillingPeriod(value: unknown): value is CommunityMembershipBillingPeriod {
    return value === 'monthly' || value === 'yearly';
}

/**
 * Expands inherited features once from the ordered plan registry. Cards and the comparison table therefore cannot
 * disagree about what "everything from the lower plan" means.
 */
export function getCommunityMembershipFeatureIds(
    planId: CommunityMembershipPlanId,
): readonly CommunityMembershipFeatureId[] {
    const selectedPlanIndex = COMMUNITY_MEMBERSHIP_PLANS.findIndex((plan) => plan.id === planId);

    return COMMUNITY_MEMBERSHIP_PLANS.slice(0, selectedPlanIndex + 1).flatMap((plan) => plan.addedFeatureIds);
}

export function getCommunityMembershipFeature(featureId: CommunityMembershipFeatureId): CommunityMembershipFeature {
    const feature = COMMUNITY_MEMBERSHIP_FEATURES.find((candidate) => candidate.id === featureId);

    if (feature === undefined) {
        throw new Error(`Unknown community membership feature: ${featureId}`);
    }

    return feature;
}
