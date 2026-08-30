import { COMMUNITY_PROJECT_TABLE_NAME } from '@/lib/community-projects/communityProjectConstants';
import type { CommunityProjectModerationStatus } from '@/lib/community-projects/communityProjectTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ModeratedCommunityProject = {
    readonly projectId: string;
    readonly status: CommunityProjectModerationStatus;
};

type ModeratedCommunityProjectRow = {
    readonly id: string;
    readonly status: CommunityProjectModerationStatus;
};

/**
 * Writes one final approval decision for a community project. The community-room route and the administration use
 * this exact mutation, so their decision cannot diverge.
 */
export async function moderateCommunityProject(
    supabase: SupabaseClient,
    projectId: string,
    status: CommunityProjectModerationStatus,
): Promise<{ readonly project: ModeratedCommunityProject | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_PROJECT_TABLE_NAME)
        .update({ status })
        .eq('id', projectId)
        .select('id, status')
        .maybeSingle();

    if (error) {
        return { project: null, errorMessage: error.message };
    }
    if (data === null) {
        return { project: null, errorMessage: null };
    }

    const project = data as ModeratedCommunityProjectRow;
    return { project: { projectId: project.id, status: project.status }, errorMessage: null };
}
