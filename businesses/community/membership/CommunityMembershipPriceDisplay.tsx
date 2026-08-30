import { FORM_SURFACE_CLASS_NAMES, type FormSurfaceAppearance } from '@/components/forms/formSurfaceAppearance';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import { cn } from '@/lib/utils';
import {
    getCommunityMembershipPlan,
    type CommunityMembershipBillingPeriod,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';
import { createCommunityMembershipPrice, formatCommunityMembershipPrice } from './communityMembershipPrice';

type CommunityMembershipPriceDisplayProps = {
    readonly planId: PaidCommunityMembershipPlanId;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly activeDiscount: ActiveDiscount | null;
    readonly className?: string;
    readonly appearance?: FormSurfaceAppearance;
};

/** Price is always led by its monthly equivalent, including when the visitor pays once a year. */
export function CommunityMembershipPriceDisplay({
    planId,
    billingPeriod,
    activeDiscount,
    className,
    appearance = 'light',
}: CommunityMembershipPriceDisplayProps) {
    const plan = getCommunityMembershipPlan(planId);
    const price = createCommunityMembershipPrice(planId, billingPeriod, activeDiscount);
    const isOriginalMonthlyPriceShown = billingPeriod === 'yearly' || activeDiscount !== null;
    const surfaceClassNames = FORM_SURFACE_CLASS_NAMES[appearance];

    return (
        <div className={className}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {isOriginalMonthlyPriceShown && (
                    <span className={cn('text-base font-medium line-through', surfaceClassNames.strikethroughText)}>
                        {formatCommunityMembershipPrice(plan.monthlyPriceCzk)}
                    </span>
                )}
                <span className={cn('text-4xl font-bold tracking-tight', surfaceClassNames.heading)}>
                    {formatCommunityMembershipPrice(price.finalMonthlyEquivalentCzk)}
                </span>
                <span className={cn('text-sm', surfaceClassNames.mutedText)}>/ měsíc</span>
            </div>
            <p className={cn('mt-2 text-xs leading-relaxed', surfaceClassNames.mutedText)}>
                {billingPeriod === 'yearly'
                    ? `Platba ${formatCommunityMembershipPrice(price.finalBillingPriceCzk)} jednou ročně.`
                    : 'Platba každý měsíc.'}{' '}
                {activeDiscount !== null && `Slevový kód přidává dalších ${activeDiscount.percent} %.`}
            </p>
        </div>
    );
}
