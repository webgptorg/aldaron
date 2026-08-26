'use client';

import { cn } from '@/lib/utils';
import {
    COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT,
    type CommunityMembershipBillingPeriod,
} from './communityMembershipConfig';

type CommunityMembershipBillingToggleProps = {
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly onChange: (billingPeriod: CommunityMembershipBillingPeriod) => void;
    readonly className?: string;
};

export function CommunityMembershipBillingToggle({
    billingPeriod,
    onChange,
    className,
}: CommunityMembershipBillingToggleProps) {
    return (
        <div
            className={cn('inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm', className)}
            role="group"
            aria-label="Frekvence platby"
        >
            <button
                type="button"
                aria-pressed={billingPeriod === 'yearly'}
                onClick={() => onChange('yearly')}
                className={cn(
                    'flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition sm:px-5',
                    billingPeriod === 'yearly'
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-950',
                )}
            >
                Ročně
                <span
                    className={cn(
                        'hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline-flex',
                        billingPeriod === 'yearly' ? 'bg-cyan-300/15 text-cyan-200' : 'bg-emerald-50 text-emerald-700',
                    )}
                >
                    {COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT} měsíce zdarma
                </span>
            </button>
            <button
                type="button"
                aria-pressed={billingPeriod === 'monthly'}
                onClick={() => onChange('monthly')}
                className={cn(
                    'min-h-10 rounded-full px-4 text-sm font-semibold transition sm:px-5',
                    billingPeriod === 'monthly'
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-950',
                )}
            >
                Měsíčně
            </button>
        </div>
    );
}
