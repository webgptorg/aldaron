import { COMMUNITY_WORKSHOP_SLUG } from '@/businesses/community/config';
import {
    getAuthenticatedWorkshopRequest,
    isAuthenticatedWorkshopRequest,
    type AuthenticatedWorkshopRequest,
} from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

export type AuthenticatedCommunityProjectRequest = AuthenticatedWorkshopRequest;

/**
 * Every project action is attached to the one authenticated community member. Keeping this check in one place makes
 * creating, voting, scraping, and opening a discussion follow exactly the same membership boundary.
 */
export async function getAuthenticatedCommunityProjectRequest(
    request: NextRequest,
): Promise<AuthenticatedCommunityProjectRequest | NextResponse> {
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, COMMUNITY_WORKSHOP_SLUG);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    return authenticatedRequest.workshopRow.room_kind === 'community'
        ? authenticatedRequest
        : NextResponse.json({ error: 'Community room not found' }, { status: 404 });
}

export function isAuthenticatedCommunityProjectRequest(
    value: AuthenticatedCommunityProjectRequest | NextResponse,
): value is AuthenticatedCommunityProjectRequest {
    return !(value instanceof NextResponse);
}
