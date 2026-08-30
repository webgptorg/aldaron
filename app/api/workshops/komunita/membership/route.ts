import {
    getAuthenticatedCommunityRequest,
    isAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';
import { NextRequest, NextResponse } from 'next/server';

/**
 * What the connected member is told about their own membership.
 *
 * Note: A member is described to themselves alone. The room asks under the community session, which is what proves
 *       which address the answer is about.
 */
export async function GET(request: NextRequest) {
    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { membership, errorMessage } = await loadCommunityMembershipByEmail(
        authenticatedRequest.supabase,
        authenticatedRequest.participant.email,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }

    return NextResponse.json(createCommunityMembershipRoomState(membership, getStripeConfigurationOrNull()), {
        headers: { 'Cache-Control': 'no-store' },
    });
}
