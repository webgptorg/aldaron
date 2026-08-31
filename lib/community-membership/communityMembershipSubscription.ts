import { createCommunityMembershipStatusFromSubscription } from '@/lib/community-membership/communityMembershipStatus';
import {
    isPaidCommunityMembershipStatus,
    type StoredCommunityMembershipStatus,
} from '@/lib/community-membership/communityMembershipTypes';
import type Stripe from 'stripe';

export type CommunityMembershipSubscriptionState = {
    readonly status: StoredCommunityMembershipStatus;
    readonly currentPeriodEndsAt: string | null;

    /**
     * Stripe keeps a subscription active while it waits for the last paid period to end. This flag preserves that
     * intent separately from the lifecycle status, so the room can offer an immediate restoration.
     */
    readonly isCancellationScheduled: boolean;
};

const MILLISECONDS_IN_SECOND = 1_000;

/**
 * When the period a member has already paid for runs out, or `null` while the gate names no period at all.
 *
 * Note: The gate records that period on every item of a subscription rather than on the subscription itself, so the
 *       last of them is the moment the whole membership is paid up to.
 */
export function readSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
    const periodEndSeconds = subscription.items.data.reduce<number | null>(
        (latestPeriodEndSeconds, subscriptionItem) =>
            latestPeriodEndSeconds === null || subscriptionItem.current_period_end > latestPeriodEndSeconds
                ? subscriptionItem.current_period_end
                : latestPeriodEndSeconds,
        null,
    );

    return periodEndSeconds === null ? null : new Date(periodEndSeconds * MILLISECONDS_IN_SECOND).toISOString();
}

/**
 * Reads the small part of a Stripe subscription which the community mirrors for its member-facing state.
 */
export function readCommunityMembershipSubscriptionState(
    subscription: Stripe.Subscription,
): CommunityMembershipSubscriptionState {
    const status = createCommunityMembershipStatusFromSubscription(subscription.status);

    return {
        status,
        currentPeriodEndsAt: readSubscriptionPeriodEnd(subscription),
        isCancellationScheduled: subscription.cancel_at_period_end === true && isPaidCommunityMembershipStatus(status),
    };
}

/**
 * Reads the subscription of a finished checkout, whether the gate sent it whole or only named it
 */
export function readSubscriptionOrNull(
    subscription: string | Stripe.Subscription | null | undefined,
    stripe: Stripe,
): Promise<Stripe.Subscription> | null {
    if (subscription === null || subscription === undefined) {
        return null;
    }

    return typeof subscription === 'string' ? stripe.subscriptions.retrieve(subscription) : Promise.resolve(subscription);
}
