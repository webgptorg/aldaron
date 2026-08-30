import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { moderateCommunityProject } from '@/lib/community-projects/communityProjectModeration';
import {
    isAuthenticatedCommunityRequest,
    getAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import {
    communityProjectIdSchema,
    communityProjectModerationSchema,
} from '@/lib/community-projects/communityProjectSchemas';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { NextRequest, NextResponse } from 'next/server';

type CommunityProjectModerationRouteContext = {
    readonly params: Promise<{ readonly projectId: string }>;
};

/**
 * Lets a moderator decide about a project without leaving the permanent community room, just as they decide about a
 * pending chat message there.
 */
export async function PATCH(request: NextRequest, context: CommunityProjectModerationRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (!isWorkshopParticipantModerating(authenticatedRequest.participant)) {
        return NextResponse.json({ error: 'Moderování projektů není pro tento účet dostupné.' }, { status: 403 });
    }

    const { projectId } = await context.params;
    if (!communityProjectIdSchema.safeParse(projectId).success) {
        return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = communityProjectModerationSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Rozhodnutí o projektu není platné.' }, { status: 400 });
    }

    const { project, errorMessage } = await moderateCommunityProject(
        authenticatedRequest.supabase,
        projectId,
        parsedResult.data.status,
    );
    if (errorMessage !== null) {
        console.error('Failed to moderate community project from the community room:', errorMessage);
        return NextResponse.json({ error: 'Projekt se nepodařilo změnit.' }, { status: 500 });
    }
    if (project === null) {
        return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    }

    return NextResponse.json(project, { headers: { 'Cache-Control': 'no-store' } });
}
