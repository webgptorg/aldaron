import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) return crossSiteResponse;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, 'komunita');
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) return authenticatedRequest;
    if (authenticatedRequest.participant.isInteractionBanned) return NextResponse.json({ error: 'Váš účet nemůže nyní publikovat.' }, { status: 403 });
    const body = await readJsonObjectOrNull(request);
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const ogImageUrl = typeof body?.ogImageUrl === 'string' ? body.ogImageUrl.trim() : null;
    try { const parsedUrl = new URL(url); if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error(); } catch { return NextResponse.json({ error: 'Zadejte platnou URL.' }, { status: 400 }); }
    if (!title || title.length > 200 || description.length > 2000) return NextResponse.json({ error: 'Doplňte název a krátký popis.' }, { status: 400 });
    const discussionSlug = `project-${randomUUID()}`;
    const { data: discussion, error: discussionError } = await authenticatedRequest.supabase.from('workshops').insert({
        slug: discussionSlug, title, description, starts_at: new Date().toISOString(), ends_at: null,
        is_published: true, allowed_reactions: ['👍'], disabled_panels: ['stage', 'watching-count', 'reactions', 'polls'],
    }).select('id').single();
    if (discussionError || !discussion) return NextResponse.json({ error: 'Diskusi projektu se nepodařila vytvořit.' }, { status: 500 });
    const { data: project, error } = await authenticatedRequest.supabase.from('community_projects').insert({
        community_workshop_id: authenticatedRequest.workshopRow.id, discussion_workshop_id: discussion.id,
        author_participant_id: authenticatedRequest.participant.id, url, title, description, og_image_url: ogImageUrl,
    }).select('id').single();
    if (error || !project) return NextResponse.json({ error: 'Projekt se nepodařilo uložit.' }, { status: 500 });
    await authenticatedRequest.supabase.from('workshop_participants').update({ is_moderator: true }).eq('id', authenticatedRequest.participant.id).eq('workshop_id', discussion.id);
    return NextResponse.json({ projectId: project.id }, { status: 201 });
}
