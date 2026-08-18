import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import {
    WORKSHOP_CONTENT_LINK_CLICK_TABLE_NAME,
    WORKSHOP_CONTENT_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopMaterialLinkClickRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly contentId: string }>;
};

export async function POST(request: NextRequest, context: WorkshopMaterialLinkClickRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const { workshopSlug, contentId } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { data: contentBlock, error: contentBlockError } = await authenticatedRequest.supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select('id')
        .eq('id', contentId)
        .eq('workshop_id', authenticatedRequest.workshopRow.id)
        .eq('is_published', true)
        .lte('unlock_at', new Date().toISOString())
        .maybeSingle();
    if (contentBlockError) {
        return NextResponse.json({ error: 'Material link could not be checked' }, { status: 500 });
    }
    if (contentBlock === null) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const { error } = await authenticatedRequest.supabase.from(WORKSHOP_CONTENT_LINK_CLICK_TABLE_NAME).insert({
        workshop_id: authenticatedRequest.workshopRow.id,
        content_block_id: contentId,
        participant_id: authenticatedRequest.participant.id,
    });
    if (error) {
        console.error('Failed to record a workshop material link click:', error.message);
        return NextResponse.json({ error: 'Material link click could not be recorded' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
