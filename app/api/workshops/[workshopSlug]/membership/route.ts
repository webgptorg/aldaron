import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import {
    getAuthenticatedMembershipRoomRequest,
    isAuthenticatedMembershipRoomRequest,
} from '@/lib/community-membership/communityMembershipRoomRequest';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';
import { NextRequest, NextResponse } from 'next/server';

type CommunityMembershipRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * What the connected member is told about their own membership.
 *
 * Note: A member is described to themselves alone. The room asks under its own session, which is what proves which
 *       address the answer is about, and the membership of that address is the same one in every room.
 */
export async function GET(request: NextRequest, context: CommunityMembershipRouteContext) {
    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedMembershipRoomRequest(request, workshopSlug);
    if (!isAuthenticatedMembershipRoomRequest(authenticatedRequest)) {
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
