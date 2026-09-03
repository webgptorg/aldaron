import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';
import {
    isCommunityMembershipCoveredByDiscountCode,
    isCommunityMembershipSubscriptionManageable,
    isPaidCommunityMembershipStatus,
    type CommunityMembershipRoomState,
} from '@/lib/community-membership/communityMembershipTypes';
import type { StripeConfiguration } from '@/lib/payments/stripeConfiguration';

/**
 * Describes the membership of one member to the room they are reading.
 *
 * Note: A membership is only offered for sale where it can actually be bought, so a server which was given no payment
 *       gate presents the community exactly as it was before there was one.
 */
export function createCommunityMembershipRoomState(
    membership: CommunityMembershipRecord | null,
    stripeConfiguration: StripeConfiguration | null,
): CommunityMembershipRoomState {
    const status = membership?.status ?? 'none';

    return {
        status,
        monthlyPriceCzk: membership?.monthlyPriceCzk ?? null,
        currentPeriodEndsAt: membership?.currentPeriodEndsAt ?? null,
        isCancellationScheduled: membership?.isCancellationScheduled === true && isPaidCommunityMembershipStatus(status),
        isPurchaseOffered: stripeConfiguration !== null && !isPaidCommunityMembershipStatus(status),
        isSubscriptionManagementOffered: stripeConfiguration !== null && isCommunityMembershipSubscriptionManageable(membership),
        isCoveredByDiscountCode: isCommunityMembershipCoveredByDiscountCode(membership),
        isPaymentInTestMode: stripeConfiguration?.isTestMode ?? false,
    };
}
