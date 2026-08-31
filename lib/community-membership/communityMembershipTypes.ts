/**
 * Where a bought membership is recorded
 */
export const COMMUNITY_MEMBERSHIP_TABLE_NAME = 'community_memberships';

/**
 * How far one member got with the paid membership
 *
 * Note: `none` is not stored anywhere. It is what a member who never opened a checkout is answered with, so the room
 *       asks one question about every member instead of two.
 */
export const STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES = ['pending', 'active', 'past-due', 'canceled'] as const;

export const COMMUNITY_MEMBERSHIP_STATUS_VALUES = [
    'none',
    ...STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES,
] as const;

export type CommunityMembershipStatus = (typeof COMMUNITY_MEMBERSHIP_STATUS_VALUES)[number];

/**
 * The statuses a stored membership can carry, which is every status except the absence of one
 */
export type StoredCommunityMembershipStatus = (typeof STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES)[number];

/**
 * What the community room is told about the membership of the member reading it
 *
 * Note: Nothing which identifies the payment itself is included, because a room only ever has to decide what to offer
 *       and what to celebrate. Card details never reach this application at all; they are given to the gate directly.
 */
export type CommunityMembershipRoomState = {
    readonly status: CommunityMembershipStatus;

    /**
     * The price this member agreed to, which stays theirs while their membership continues, or `null` while they have
     * no membership to be charged for
     */
    readonly monthlyPriceCzk: number | null;
    readonly currentPeriodEndsAt: string | null;

    /**
     * Whether the member stopped the next renewal but keeps every paid benefit through the period they already paid
     * for. It is deliberately separate from `status`: Stripe keeps such a subscription active until that period ends.
     */
    readonly isCancellationScheduled: boolean;

    /**
     * Whether this member can buy the membership right now, which needs both a configured gate and a membership they
     * are not already paying for
     */
    readonly isPurchaseOffered: boolean;

    /**
     * Whether this room can change the existing Stripe subscription. A membership without a subscription, such as a
     * checkout which never finished, has nothing to cancel or restore.
     */
    readonly isSubscriptionManagementOffered: boolean;

    /**
     * Whether the configured gate is the test one, which the room says out loud so that a rehearsal is never mistaken
     * for a real payment
     */
    readonly isPaymentInTestMode: boolean;
};

export function isCommunityMembershipStatus(value: unknown): value is CommunityMembershipStatus {
    return COMMUNITY_MEMBERSHIP_STATUS_VALUES.includes(value as CommunityMembershipStatus);
}

/**
 * Whether this status entitles a member to everything the paid membership adds
 *
 * Note: A membership whose payment failed keeps its entitlement until the gate gives up on it, because a card which
 *       expired overnight is not somebody leaving the community.
 */
export function isPaidCommunityMembershipStatus(status: CommunityMembershipStatus): boolean {
    return status === 'active' || status === 'past-due';
}

/**
 * The one form of a contact address a membership is stored and looked up under, so that the same person is the same
 * member however they typed their address into the room.
 */
export function normalizeCommunityMemberEmail(email: string): string {
    return email.trim().toLowerCase();
}
