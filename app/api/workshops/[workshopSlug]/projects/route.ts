import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_PROJECT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    mapWorkshopProjectRow,
    WORKSHOP_PROJECT_COLUMNS,
    type WorkshopProjectRow,
} from '@/lib/workshops/workshopDatabase';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import {
    getDisabledWorkshopPanelResponseOrNull,
    getWorkshopInteractionBanResponseOrNull,
    getWorkshopProjectStatusForParticipant,
} from '@/lib/workshops/workshopParticipantInteraction';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopProjectCreateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

const PROJECT_RATE_LIMIT_ERROR = 'WORKSHOP_PROJECT_RATE_LIMITED';

type WorkshopProjectsRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * Adds a member project to the lasting community gallery. A project uses the existing room session and moderation
 * state, rather than accepting an author name or e-mail from the browser; that keeps it attributable without giving
 * the public gallery access to member identities.
 */
export async function POST(request: NextRequest, context: WorkshopProjectsRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopProjectCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Project title, description, or URL is invalid' },
            { status: 400 },
        );
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (!getWorkshopKindCapabilities(authenticatedRequest.workshopRow.room_kind).isProjectSharingOffered) {
        return NextResponse.json({ error: 'Project sharing is not available in this room' }, { status: 404 });
    }

    const disabledProjectsResponse = getDisabledWorkshopPanelResponseOrNull(
        authenticatedRequest.workshopRow,
        'projects',
    );
    if (disabledProjectsResponse) {
        return disabledProjectsResponse;
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    const status = getWorkshopProjectStatusForParticipant(authenticatedRequest.participant);
    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_PROJECT_TABLE_NAME)
        .insert({
            workshop_id: authenticatedRequest.workshopRow.id,
            participant_id: authenticatedRequest.participant.id,
            author_name: authenticatedRequest.participant.fullname,
            title: parsedResult.data.title,
            description: parsedResult.data.description,
            url: parsedResult.data.url,
            status,
        })
        .select(WORKSHOP_PROJECT_COLUMNS)
        .single();
    if (error?.message.includes(PROJECT_RATE_LIMIT_ERROR)) {
        return NextResponse.json({ error: 'Please wait before sharing another project' }, { status: 429 });
    }
    if (error || data === null) {
        console.error('Failed to save a community project:', error?.message ?? 'No project returned');
        return NextResponse.json({ error: 'Project could not be saved' }, { status: 500 });
    }

    const project = mapWorkshopProjectRow(data as WorkshopProjectRow, authenticatedRequest.participant.id);
    if (project.status === 'approved') {
        await broadcastWorkshopEvent(authenticatedRequest.supabase, authenticatedRequest.workshopRow, {
            kind: 'state-changed',
        });
    }

    return NextResponse.json({ project }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
