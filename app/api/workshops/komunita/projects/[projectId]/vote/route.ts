import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    isAuthenticatedCommunityProjectRequest,
    getAuthenticatedCommunityProjectRequest,
} from '@/lib/community-projects/communityProjectRequest';
import { communityProjectIdSchema, communityProjectVoteSchema } from '@/lib/community-projects/communityProjectSchemas';
import { setCommunityProjectVote } from '@/lib/community-projects/communityProjectService';
import { NextRequest, NextResponse } from 'next/server';

type CommunityProjectVoteRouteContext = {
    readonly params: Promise<{ readonly projectId: string }>;
};

export async function POST(request: NextRequest, context: CommunityProjectVoteRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityProjectRequest(request);
    if (!isAuthenticatedCommunityProjectRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { projectId } = await context.params;
    if (!communityProjectIdSchema.safeParse(projectId).success) {
        return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = communityProjectVoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Hlas projektu není platný.' }, { status: 400 });
    }

    const savedVote = await setCommunityProjectVote(projectId, authenticatedRequest.participant.id, parsedResult.data.vote);
    if (savedVote.result === null) {
        const isProjectMissing = savedVote.isProjectMissing;
        if (!isProjectMissing) {
            console.error('Failed to save community project vote:', savedVote.errorMessage);
        }
        return NextResponse.json(
            { error: isProjectMissing ? 'Projekt nebyl nalezen.' : 'Hlas se nepodařilo uložit.' },
            { status: isProjectMissing ? 404 : 500 },
        );
    }

    return NextResponse.json(savedVote.result);
}
