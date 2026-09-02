import { requestJson, sendJson } from '@/lib/api/requestJson';
import { createCommunityMembershipApiPaths } from '@/lib/community-membership/communityMembershipApiPaths';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';

/**
 * What a member accepts when they open the payment gate
 */
export type CommunityMembershipCheckoutValues = {
    readonly discountCode: string;
    readonly termsAccepted: true;
};

/**
 * Note: Every one of these is asked of the room the member is connected to, because that room session is what proves
 *       whose membership is being read or changed. Which room it is never decides the answer: the membership belongs
 *       to the address of the member.
 */
export function fetchCommunityMembership(workshopSlug: string): Promise<CommunityMembershipRoomState> {
    return requestJson<CommunityMembershipRoomState>(createCommunityMembershipApiPaths(workshopSlug).membership, {
        credentials: 'same-origin',
    });
}

/**
 * Asks for the address of the payment gate, which the browser is then sent to.
 */
export function startCommunityMembershipCheckout(
    workshopSlug: string,
    values: CommunityMembershipCheckoutValues,
): Promise<{ readonly checkoutUrl: string }> {
    return sendJson<{ readonly checkoutUrl: string }>(
        createCommunityMembershipApiPaths(workshopSlug).checkout,
        'POST',
        values,
    );
}

/**
 * Confirms the checkout a returning member came back from, and answers with their membership as it now stands.
 */
export function confirmCommunityMembershipCheckout(
    workshopSlug: string,
    checkoutSessionId: string,
): Promise<CommunityMembershipRoomState> {
    return sendJson<CommunityMembershipRoomState>(
        createCommunityMembershipApiPaths(workshopSlug).checkoutConfirmation,
        'POST',
        { checkoutSessionId },
    );
}

/**
 * Stops the next recurring payment while keeping access through the period the member already paid for.
 */
export function scheduleCommunityMembershipCancellation(workshopSlug: string): Promise<CommunityMembershipRoomState> {
    return sendJson<CommunityMembershipRoomState>(
        createCommunityMembershipApiPaths(workshopSlug).cancellation,
        'POST',
        {},
    );
}

/**
 * Restores automatic renewal before the already-paid period ends.
 */
export function reactivateCommunityMembership(workshopSlug: string): Promise<CommunityMembershipRoomState> {
    return sendJson<CommunityMembershipRoomState>(
        createCommunityMembershipApiPaths(workshopSlug).cancellation,
        'DELETE',
        {},
    );
}

/**
 * Opens Stripe's short-lived customer portal for the membership of the connected member.
 */
export function openCommunityMembershipSubscriptionPortal(
    workshopSlug: string,
): Promise<{ readonly portalUrl: string }> {
    return sendJson<{ readonly portalUrl: string }>(createCommunityMembershipApiPaths(workshopSlug).portal, 'POST', {});
}
