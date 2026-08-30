import { COMMUNITY_PATH } from '@/businesses/community/config';
import {
    createUrlWithoutCommunityMembershipCheckoutReturn,
    readCommunityMembershipCheckoutReturn,
} from '@/businesses/community/membership/communityMembershipCheckoutReturn';
import { describe, expect, it } from 'vitest';

describe('community membership checkout return', () => {
    it('reads a paid return together with the checkout it belongs to', () => {
        expect(readCommunityMembershipCheckoutReturn('?membership=paid&checkoutSession=cs_test_Example')).toEqual({
            result: 'paid',
            checkoutSessionId: 'cs_test_Example',
        });
    });

    it('reads a member who came back without paying', () => {
        expect(readCommunityMembershipCheckoutReturn('?membership=cancelled')).toEqual({
            result: 'cancelled',
            checkoutSessionId: null,
        });
    });

    it('reads nothing from a room which was simply opened', () => {
        expect(readCommunityMembershipCheckoutReturn('')).toEqual({ result: null, checkoutSessionId: null });
        expect(readCommunityMembershipCheckoutReturn('?membership=whatever')).toEqual({
            result: null,
            checkoutSessionId: null,
        });
    });

    it('keeps everything else in the address while removing what the gate added to it', () => {
        expect(
            createUrlWithoutCommunityMembershipCheckoutReturn(
                `https://ptbk.io${COMMUNITY_PATH}?membership=paid&checkoutSession=cs_test_Example&code=SLEVA#materialy`,
            ),
        ).toBe(`${COMMUNITY_PATH}?code=SLEVA#materialy`);
    });
});
