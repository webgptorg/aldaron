import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) return crossSiteResponse;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, 'komunita');
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) return authenticatedRequest;
    if (authenticatedRequest.participant.isInteractionBanned) return NextResponse.json({ error: 'Váš účet nemůže nyní hlasovat.' }, { status: 403 });
    const { projectId } = await context.params;
    const body = await request.json().catch(() => null) as { vote?: number } | null;
    const vote = body?.vote === -1 ? -1 : body?.vote === 1 ? 1 : null;
    if (vote === null) return NextResponse.json({ error: 'Neplatný hlas.' }, { status: 400 });
    const { data: project } = await authenticatedRequest.supabase.from('community_projects').select('id').eq('id', projectId).eq('community_workshop_id', authenticatedRequest.workshopRow.id).maybeSingle();
    if (!project) return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    const { error } = await authenticatedRequest.supabase.from('community_project_votes').upsert({ project_id: projectId, participant_id: authenticatedRequest.participant.id, vote }, { onConflict: 'project_id,participant_id' });
    if (error) return NextResponse.json({ error: 'Hlas se nepodařilo uložit.' }, { status: 500 });
    const { data: updatedProject } = await authenticatedRequest.supabase.from('community_projects').select('upvote_count,downvote_count').eq('id', projectId).maybeSingle();
    return NextResponse.json(updatedProject ?? {});
}
