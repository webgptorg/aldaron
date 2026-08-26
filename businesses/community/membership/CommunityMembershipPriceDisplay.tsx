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
    readonly mutedClassName?: string;
};

/** Price is always led by its monthly equivalent, including when the visitor pays once a year. */
export function CommunityMembershipPriceDisplay({
    planId,
    billingPeriod,
    activeDiscount,
    className,
    mutedClassName,
}: CommunityMembershipPriceDisplayProps) {
    const plan = getCommunityMembershipPlan(planId);
    const price = createCommunityMembershipPrice(planId, billingPeriod, activeDiscount);
    const isOriginalMonthlyPriceShown = billingPeriod === 'yearly' || activeDiscount !== null;

    return (
        <div className={className}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {isOriginalMonthlyPriceShown && (
                    <span className="text-base font-medium text-slate-400 line-through decoration-slate-400/80">
                        {formatCommunityMembershipPrice(plan.monthlyPriceCzk)}
                    </span>
                )}
                <span className="text-4xl font-bold tracking-tight text-slate-950">
                    {formatCommunityMembershipPrice(price.finalMonthlyEquivalentCzk)}
                </span>
                <span className={cn('text-sm text-slate-500', mutedClassName)}>/ měsíc</span>
            </div>
            <p className={cn('mt-2 text-xs leading-relaxed text-slate-500', mutedClassName)}>
                {billingPeriod === 'yearly'
                    ? `Platba ${formatCommunityMembershipPrice(price.finalBillingPriceCzk)} jednou ročně.`
                    : 'Platba každý měsíc.'}{' '}
                {activeDiscount !== null && `Slevový kód přidává dalších ${activeDiscount.percent} %.`}
            </p>
        </div>
    );
}
