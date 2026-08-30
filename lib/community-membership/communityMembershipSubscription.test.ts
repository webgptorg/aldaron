import { readSubscriptionPeriodEnd } from '@/lib/community-membership/communityMembershipSubscription';
import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';

function createSubscription(periodEndSeconds: readonly number[]): Stripe.Subscription {
    return {
        items: { data: periodEndSeconds.map((current_period_end) => ({ current_period_end })) },
    } as Stripe.Subscription;
}

describe('community membership subscription', () => {
    it('reads the moment the paid period runs out', () => {
        expect(readSubscriptionPeriodEnd(createSubscription([1_790_000_000]))).toBe('2026-09-21T14:13:20.000Z');
    });

    it('takes the last period of a subscription which has several items', () => {
        expect(readSubscriptionPeriodEnd(createSubscription([1_780_000_000, 1_790_000_000, 1_785_000_000]))).toBe(
            '2026-09-21T14:13:20.000Z',
        );
    });

    it('names no period for a subscription which has none', () => {
        expect(readSubscriptionPeriodEnd(createSubscription([]))).toBeNull();
    });
});
