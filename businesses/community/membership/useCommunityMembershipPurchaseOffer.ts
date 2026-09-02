'use client';

import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';

/**
 * The paid membership as a surface which keeps something behind it offers that membership
 */
export type CommunityMembershipPurchaseOffer = {
    /**
     * Opens the very same membership popup the badge in the header of the room opens
     */
    readonly openMembershipModal: () => void;
};

/**
 * What the room may offer the member reading it, or `null` while there is nothing to offer them.
 *
 * Note: Every surface which withholds something behind the paid membership asks this one question, so a room can
 *       never name what a purchase would unlock in one place while saying nothing about it in another.
 * Note: A member who already pays is never sold the same membership again, a membership which is still being loaded
 *       decides nothing, and a server which was given no payment gate offers nothing at all rather than a button
 *       which could not work.
 */
export function useCommunityMembershipPurchaseOffer(): CommunityMembershipPurchaseOffer | null {
    const membershipRoom = useCommunityMembershipRoom();
    const membership = membershipRoom?.membership ?? null;

    if (
        membershipRoom === null ||
        membership === null ||
        !membership.isPurchaseOffered ||
        isPaidCommunityMembershipStatus(membership.status)
    ) {
        return null;
    }

    return { openMembershipModal: membershipRoom.openMembershipModal };
}
