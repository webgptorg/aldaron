import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import {
    getAuthenticatedCommunityRequest,
    isAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import { applyCommunityMembershipSubscriptionChange } from '@/lib/community-membership/communityMembershipActivation';
import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import { isCommunityMembershipSubscriptionManageable } from '@/lib/community-membership/communityMembershipTypes';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { NextRequest, NextResponse } from 'next/server';

type CommunityMembershipCancellationChange = {
    readonly isCancellationScheduled: boolean;
    readonly failureMessage: string;
    readonly actionDescription: string;
};

const SCHEDULE_CANCELLATION_CHANGE: CommunityMembershipCancellationChange = {
    isCancellationScheduled: true,
    failureMessage: COMMUNITY_MEMBERSHIP_MESSAGES.membershipCancellationNotChanged,
    actionDescription: 'schedule the cancellation of',
};

const REACTIVATE_MEMBERSHIP_CHANGE: CommunityMembershipCancellationChange = {
    isCancellationScheduled: false,
    failureMessage: COMMUNITY_MEMBERSHIP_MESSAGES.membershipReactivationNotChanged,
    actionDescription: 'restore the renewal of',
};

/**
 * Changes only the next renewal of the connected member's subscription. The resulting Stripe subscription passes
 * through the same mirroring path as a webhook, so the modal, a refresh and a later Stripe event all read one state.
 */
async function changeCommunityMembershipCancellation(
    request: NextRequest,
    cancellationChange: CommunityMembershipCancellationChange,
): Promise<NextResponse> {
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
    if (!isCommunityMembershipSubscriptionManageable(membership)) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipCannotBeManaged }, { status: 409 });
    }

    let updatedSubscription;
    try {
        updatedSubscription = await gateway.stripe.subscriptions.update(membership.stripeSubscriptionId, {
            cancel_at_period_end: cancellationChange.isCancellationScheduled,
        });
    } catch (error) {
        console.error(`Failed to ${cancellationChange.actionDescription} community membership:`, error);
        return NextResponse.json({ error: cancellationChange.failureMessage }, { status: 502 });
    }

    const { errorMessage } = await applyCommunityMembershipSubscriptionChange(supabase, updatedSubscription);
    if (errorMessage !== null) {
        console.error(`Failed to save the changed community membership subscription: ${errorMessage}`);
        return NextResponse.json({ error: cancellationChange.failureMessage }, { status: 500 });
    }

    const refreshedMembershipResult = await loadCommunityMembershipByEmail(supabase, participant.email);
    if (refreshedMembershipResult.errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }

    return NextResponse.json(createCommunityMembershipRoomState(refreshedMembershipResult.membership, gateway.configuration), {
        headers: { 'Cache-Control': 'no-store' },
    });
}

/**
 * Stops automatic renewal while keeping access through the paid period.
 */
export function POST(request: NextRequest): Promise<NextResponse> {
    return changeCommunityMembershipCancellation(request, SCHEDULE_CANCELLATION_CHANGE);
}

/**
 * Restores automatic renewal before the paid period ends.
 */
export function DELETE(request: NextRequest): Promise<NextResponse> {
    return changeCommunityMembershipCancellation(request, REACTIVATE_MEMBERSHIP_CHANGE);
}
