import {
    COMMUNITY_MEMBERSHIP_CANCELLED_RESULT,
    COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME,
    COMMUNITY_MEMBERSHIP_PAID_RESULT,
    COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME,
} from '@/businesses/community/config';

/**
 * How taking the paid membership ended: paid at the gate, left unpaid, or redeemed with a voucher which needed no
 * gate at all. Only the first two ever come back in an address, because the third never leaves the room.
 */
export type CommunityMembershipPurchaseOutcome = 'paid' | 'cancelled' | 'redeemed';

export type CommunityMembershipCheckoutReturn = {
    readonly result: CommunityMembershipPurchaseOutcome | null;

    /**
     * The checkout the gate says was finished, which is `null` for a member who came back without paying
     */
    readonly checkoutSessionId: string | null;
};

/**
 * Reads what the payment gate says about the member who has just come back to the room.
 *
 * Note: This is only ever the beginning of the answer. What really happened to that checkout is asked of the gate
 *       itself, so an address which somebody typed by hand celebrates nothing.
 */
export function readCommunityMembershipCheckoutReturn(search: string): CommunityMembershipCheckoutReturn {
    const searchParameters = new URLSearchParams(search);
    const result = searchParameters.get(COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME);

    if (result === COMMUNITY_MEMBERSHIP_PAID_RESULT) {
        return {
            result: 'paid',
            checkoutSessionId: searchParameters.get(COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME),
        };
    }

    return {
        result: result === COMMUNITY_MEMBERSHIP_CANCELLED_RESULT ? 'cancelled' : null,
        checkoutSessionId: null,
    };
}

/**
 * The very same address without what the gate added to it, so that reloading the room does not confirm a payment
 * again and the address of the room stays shareable.
 */
export function createUrlWithoutCommunityMembershipCheckoutReturn(url: string): string {
    const cleanedUrl = new URL(url);
    cleanedUrl.searchParams.delete(COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME);
    cleanedUrl.searchParams.delete(COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME);

    return `${cleanedUrl.pathname}${cleanedUrl.search}${cleanedUrl.hash}`;
}
