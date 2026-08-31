import { COMMUNITY_PATH } from '@/businesses/community/config';
import { createRequestSiteUrl } from '@/lib/api/createRequestSiteUrl';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import {
    getAuthenticatedCommunityRequest,
    isAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { isCommunityMembershipSubscriptionManageable } from '@/lib/community-membership/communityMembershipTypes';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a short-lived Stripe Customer Portal address for the connected member's own paid membership.
 *
 * Note: The customer id remains server-only. A portal URL is safe to return because Stripe makes it short-lived and
 *       scoped to that customer, while this endpoint still requires the narrowly scoped community session.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const gateway = getStripeGatewayOrNull();
    if (gateway === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipCannotBeManaged }, { status: 503 });
    }

    const { participant, supabase } = authenticatedRequest;
    const membershipResult = await loadCommunityMembershipByEmail(supabase, participant.email);
    if (membershipResult.errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }

    const membership = membershipResult.membership;
    if (!isCommunityMembershipSubscriptionManageable(membership) || membership.stripeCustomerId === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipCannotBeManaged }, { status: 409 });
    }

    let portalSession;
    try {
        portalSession = await gateway.stripe.billingPortal.sessions.create({
            customer: membership.stripeCustomerId,
            return_url: createRequestSiteUrl(request, COMMUNITY_PATH),
        });
    } catch (error) {
        console.error('Failed to open the community membership Stripe portal:', error);
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipPortalNotOpened }, { status: 502 });
    }

    return NextResponse.json(
        { portalUrl: portalSession.url },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
