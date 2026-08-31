import {
    readCommunityMembershipSubscriptionState,
    readSubscriptionPeriodEnd,
} from '@/lib/community-membership/communityMembershipSubscription';
import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';

function createSubscription(
    periodEndSeconds: readonly number[],
    options: { readonly status?: Stripe.Subscription.Status; readonly isCancellationScheduled?: boolean } = {},
): Stripe.Subscription {
    return {
        status: options.status ?? 'active',
        cancel_at_period_end: options.isCancellationScheduled ?? false,
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

    it('keeps a scheduled cancellation separate from an otherwise active paid membership', () => {
        expect(
            readCommunityMembershipSubscriptionState(createSubscription([1_790_000_000], { isCancellationScheduled: true })),
        ).toEqual({
            status: 'active',
            currentPeriodEndsAt: '2026-09-21T14:13:20.000Z',
            isCancellationScheduled: true,
        });
    });

    it('does not offer a reactivation after Stripe has already ended the subscription', () => {
        expect(
            readCommunityMembershipSubscriptionState(
                createSubscription([], { status: 'canceled', isCancellationScheduled: true }),
            ).isCancellationScheduled,
        ).toBe(false);
    });
});
