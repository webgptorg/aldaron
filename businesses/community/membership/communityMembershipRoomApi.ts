import {
    COMMUNITY_MEMBERSHIP_API_PATH,
    COMMUNITY_MEMBERSHIP_CANCELLATION_API_PATH,
    COMMUNITY_MEMBERSHIP_CHECKOUT_API_PATH,
    COMMUNITY_MEMBERSHIP_CHECKOUT_CONFIRMATION_API_PATH,
    COMMUNITY_MEMBERSHIP_PORTAL_API_PATH,
} from '@/businesses/community/config';
import { requestJson, sendJson } from '@/lib/api/requestJson';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';

/**
 * What a member accepts when they open the payment gate
 */
export type CommunityMembershipCheckoutValues = {
    readonly discountCode: string;
    readonly termsAccepted: true;
};

export function fetchCommunityMembership(): Promise<CommunityMembershipRoomState> {
    return requestJson<CommunityMembershipRoomState>(COMMUNITY_MEMBERSHIP_API_PATH, {
        credentials: 'same-origin',
    });
}

/**
 * Asks for the address of the payment gate, which the browser is then sent to.
 */
export function startCommunityMembershipCheckout(
    values: CommunityMembershipCheckoutValues,
): Promise<{ readonly checkoutUrl: string }> {
    return sendJson<{ readonly checkoutUrl: string }>(COMMUNITY_MEMBERSHIP_CHECKOUT_API_PATH, 'POST', values);
}

/**
 * Confirms the checkout a returning member came back from, and answers with their membership as it now stands.
 */
export function confirmCommunityMembershipCheckout(checkoutSessionId: string): Promise<CommunityMembershipRoomState> {
    return sendJson<CommunityMembershipRoomState>(COMMUNITY_MEMBERSHIP_CHECKOUT_CONFIRMATION_API_PATH, 'POST', {
        checkoutSessionId,
    });
}

/**
 * Stops the next recurring payment while keeping access through the period the member already paid for.
 */
export function scheduleCommunityMembershipCancellation(): Promise<CommunityMembershipRoomState> {
    return sendJson<CommunityMembershipRoomState>(COMMUNITY_MEMBERSHIP_CANCELLATION_API_PATH, 'POST', {});
}

/**
 * Restores automatic renewal before the already-paid period ends.
 */
export function reactivateCommunityMembership(): Promise<CommunityMembershipRoomState> {
    return sendJson<CommunityMembershipRoomState>(COMMUNITY_MEMBERSHIP_CANCELLATION_API_PATH, 'DELETE', {});
}

/**
 * Opens Stripe's short-lived customer portal for the membership of the connected community member.
 */
export function openCommunityMembershipSubscriptionPortal(): Promise<{ readonly portalUrl: string }> {
    return sendJson<{ readonly portalUrl: string }>(COMMUNITY_MEMBERSHIP_PORTAL_API_PATH, 'POST', {});
}
