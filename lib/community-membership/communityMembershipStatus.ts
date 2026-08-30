import type { StoredCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import type Stripe from 'stripe';

/**
 * Translates what the payment gate says about a subscription into what the community says about a membership.
 *
 * Note: The gate knows far more states than the community needs. A subscription which is being retried is still a
 *       membership somebody is paying for, while everything the gate has given up on is a membership which ended.
 */
export function createCommunityMembershipStatusFromSubscription(
    subscriptionStatus: Stripe.Subscription.Status,
): StoredCommunityMembershipStatus {
    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
        return 'active';
    }

    if (subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid') {
        return 'past-due';
    }

    if (subscriptionStatus === 'incomplete') {
        return 'pending';
    }

    return 'canceled';
}
