import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import {
    getAuthenticatedWorkshopRequest,
    isAuthenticatedWorkshopRequest,
    type AuthenticatedWorkshopRequest,
} from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

export type AuthenticatedMembershipRoomRequest = AuthenticatedWorkshopRequest;

/**
 * Every action on a membership is attached to the member connected to the room it is acted on from.
 *
 * Note: The membership belongs to the address that member connected with, so the community and a workshop occurrence
 *       read and change the very same membership under their own narrowly scoped session. Keeping this check in one
 *       place makes reading, buying, cancelling and managing it follow exactly the same boundary in every room.
 */
export async function getAuthenticatedMembershipRoomRequest(
    request: NextRequest,
    workshopSlug: string,
): Promise<AuthenticatedMembershipRoomRequest | NextResponse> {
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    return getWorkshopKindCapabilities(authenticatedRequest.workshopRow.room_kind).isMembershipOffered
        ? authenticatedRequest
        : NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotOfferedInRoom }, { status: 404 });
}

export function isAuthenticatedMembershipRoomRequest(
    value: AuthenticatedMembershipRoomRequest | NextResponse,
): value is AuthenticatedMembershipRoomRequest {
    return !(value instanceof NextResponse);
}
