import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CommunityProject = {
    readonly id: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly ogImageUrl: string | null;
    readonly upvoteCount: number;
    readonly downvoteCount: number;
    readonly authorName: string;
    readonly discussionSlug: string;
};

type ProjectRow = { id: string; url: string; title: string; description: string; og_image_url: string | null; upvote_count: number; downvote_count: number; discussion_workshop_id: string; author_participant_id: string };

export function getCommunityProjectDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export async function loadCommunityProjects(limit?: number): Promise<readonly CommunityProject[]> {
    const supabase = getCommunityProjectDatabaseOrNull();
    if (!supabase) return [];
    let query = supabase.from('community_projects').select('id,url,title,description,og_image_url,upvote_count,downvote_count,discussion_workshop_id,author_participant_id').order('upvote_count', { ascending: false }).order('created_at', { ascending: false });
    if (limit !== undefined) query = query.limit(limit);
    const { data, error } = await query;
    if (error) { console.error('Failed to load community projects:', error.message); return []; }
    const rows = (data ?? []) as unknown as ProjectRow[];
    const participantIds = rows.map((row) => row.author_participant_id);
    const workshopIds = rows.map((row) => row.discussion_workshop_id);
    const [participants, workshops] = await Promise.all([
        participantIds.length ? supabase.from('workshop_participants').select('id,fullname').in('id', participantIds) : Promise.resolve({ data: [], error: null }),
        workshopIds.length ? supabase.from('workshops').select('id,slug').in('id', workshopIds) : Promise.resolve({ data: [], error: null }),
    ]);
    const authorNames = new Map(((participants.data ?? []) as { id: string; fullname: string }[]).map((row) => [row.id, row.fullname]));
    const discussionSlugs = new Map(((workshops.data ?? []) as { id: string; slug: string }[]).map((row) => [row.id, row.slug]));
    return rows.map((row) => ({
        id: row.id, url: row.url, title: row.title, description: row.description, ogImageUrl: row.og_image_url,
        upvoteCount: row.upvote_count, downvoteCount: row.downvote_count,
        authorName: authorNames.get(row.author_participant_id) ?? 'Člen komunity',
        discussionSlug: discussionSlugs.get(row.discussion_workshop_id) ?? row.discussion_workshop_id,
    }));
}

export async function findCommunityProject(projectId: string): Promise<CommunityProject | null> {
    const projects = await loadCommunityProjects();
    return projects.find((project) => project.id === projectId) ?? null;
}
