import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';

const STRIPE_DASHBOARD_ORIGIN = 'https://dashboard.stripe.com';

type StripeDashboardMembership = Pick<
    CommunityMembershipRecord,
    'stripeCheckoutSessionId' | 'stripeSubscriptionId' | 'isTestPayment'
>;

function createStripeDashboardPath(isTestPayment: boolean, path: string): string {
    return `${STRIPE_DASHBOARD_ORIGIN}/${isTestPayment ? 'test/' : ''}${path}`;
}

/**
 * Opens the Stripe object which is authoritative for this record: a subscription once it exists, otherwise the
 * checkout that is still waiting to be completed. The URL never reaches a public member; only the admin table uses it.
 */
export function createCommunityMembershipStripeDashboardUrl(
    membership: StripeDashboardMembership,
): string | null {
    if (membership.stripeSubscriptionId !== null) {
        return createStripeDashboardPath(
            membership.isTestPayment,
            `subscriptions/${encodeURIComponent(membership.stripeSubscriptionId)}`,
        );
    }

    return membership.stripeCheckoutSessionId === null
        ? null
        : createStripeDashboardPath(
              membership.isTestPayment,
              `payments/checkout/sessions/${encodeURIComponent(membership.stripeCheckoutSessionId)}`,
          );
}
