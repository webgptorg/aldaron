import { createCommunityMembershipStripeDashboardUrl } from '@/lib/community-membership/communityMembershipStripeDashboard';
import { describe, expect, it } from 'vitest';

describe('community membership Stripe dashboard link', () => {
    it('opens a live subscription where a payment can be managed', () => {
        expect(
            createCommunityMembershipStripeDashboardUrl({
                stripeSubscriptionId: 'sub_live_Example',
                stripeCheckoutSessionId: 'cs_live_Example',
                isTestPayment: false,
            }),
        ).toBe('https://dashboard.stripe.com/subscriptions/sub_live_Example');
    });

    it('opens a test checkout while the subscription does not exist yet', () => {
        expect(
            createCommunityMembershipStripeDashboardUrl({
                stripeSubscriptionId: null,
                stripeCheckoutSessionId: 'cs_test_Example',
                isTestPayment: true,
            }),
        ).toBe('https://dashboard.stripe.com/test/payments/checkout/sessions/cs_test_Example');
    });

    it('does not make an external management link without a Stripe object', () => {
        expect(
            createCommunityMembershipStripeDashboardUrl({
                stripeSubscriptionId: null,
                stripeCheckoutSessionId: null,
                isTestPayment: false,
            }),
        ).toBeNull();
    });
});
