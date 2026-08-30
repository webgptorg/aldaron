import { COMMUNITY_WORKSHOP_SLUG } from '@/businesses/community/config';
import {
    getAuthenticatedWorkshopRequest,
    isAuthenticatedWorkshopRequest,
    type AuthenticatedWorkshopRequest,
} from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

export type AuthenticatedCommunityRequest = AuthenticatedWorkshopRequest;

/**
 * Every community action is attached to the one authenticated community member. Keeping this check in one place makes
 * sharing a project, voting, opening a discussion and buying a membership follow exactly the same membership boundary.
 */
export async function getAuthenticatedCommunityRequest(
    request: NextRequest,
): Promise<AuthenticatedCommunityRequest | NextResponse> {
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, COMMUNITY_WORKSHOP_SLUG);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    return authenticatedRequest.workshopRow.room_kind === 'community'
        ? authenticatedRequest
        : NextResponse.json({ error: 'Community room not found' }, { status: 404 });
}

export function isAuthenticatedCommunityRequest(
    value: AuthenticatedCommunityRequest | NextResponse,
): value is AuthenticatedCommunityRequest {
    return !(value instanceof NextResponse);
}
