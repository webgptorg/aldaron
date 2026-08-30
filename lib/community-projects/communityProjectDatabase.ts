import {
    COMMUNITY_PROJECT_TABLE_NAME,
    COMMUNITY_PROJECT_VOTE_TABLE_NAME,
} from '@/lib/community-projects/communityProjectConstants';
import {
    getCommunityProjectVoteFromDatabaseValue,
    type CommunityProject,
    type CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import type { WorkshopParticipant, WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const COMMUNITY_PROJECT_COLUMNS =
    'id, author_community_participant_id, discussion_workshop_id, url, title, description, preview_image_url, status, upvote_count, downvote_count, created_at';
const COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE = 500;
const MAXIMAL_VISIBLE_PENDING_COMMUNITY_PROJECT_COUNT = 50;

type CommunityProjectRow = {
    readonly id: string;
    readonly author_community_participant_id: string;
    readonly discussion_workshop_id: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly preview_image_url: string | null;
    readonly status: WorkshopSubmissionStatus;
    readonly upvote_count: number;
    readonly downvote_count: number;
    readonly created_at: string;
};

type CommunityProjectAuthorRow = {
    readonly id: string;
    readonly fullname: string;
};

type CommunityProjectVoteRow = {
    readonly project_id: string;
    readonly vote: number;
};

type CommunityProjectDiscussionRow = {
    readonly id: string;
    readonly slug: string;
};

type CommunityProjectRowsResult = {
    readonly rows: readonly CommunityProjectRow[] | null;
    readonly errorMessage: string | null;
};

function getProjectIdChunks(projectIds: readonly string[]): readonly string[][] {
    const chunks: string[][] = [];
    for (let fromIndex = 0; fromIndex < projectIds.length; fromIndex += COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE) {
        chunks.push(projectIds.slice(fromIndex, fromIndex + COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE));
    }

    return chunks;
}

function isCommunityProjectVisibleToParticipant(
    project: CommunityProjectRow,
    communityParticipant: WorkshopParticipant | null,
): boolean {
    if (project.status === 'approved') {
        return true;
    }

    return (
        project.status === 'pending' &&
        communityParticipant !== null &&
        (project.author_community_participant_id === communityParticipant.id ||
            isWorkshopParticipantModerating(communityParticipant))
    );
}

function getPendingProjectAuthorParticipantId(
    communityParticipant: WorkshopParticipant,
): string | null {
    return isWorkshopParticipantModerating(communityParticipant) ? null : communityParticipant.id;
}

async function loadCommunityProjectRowsByStatus(
    supabase: SupabaseClient,
    status: WorkshopSubmissionStatus,
    authorCommunityParticipantId: string | null,
    limit: number | null,
): Promise<CommunityProjectRowsResult> {
    const createQuery = () => {
        let query = supabase
            .from(COMMUNITY_PROJECT_TABLE_NAME)
            .select(COMMUNITY_PROJECT_COLUMNS)
            .eq('status', status)
            .order('upvote_count', { ascending: false })
            .order('created_at', { ascending: false });
        if (authorCommunityParticipantId !== null) {
            query = query.eq('author_community_participant_id', authorCommunityParticipantId);
        }

        return query;
    };

    if (limit !== null) {
        const { data, error } = await createQuery().limit(limit);
        return {
            rows: error === null ? ((data ?? []) as readonly CommunityProjectRow[]) : null,
            errorMessage: error?.message ?? null,
        };
    }

    const { rows, errorMessage } = await loadAllSupabaseRows<CommunityProjectRow>(
        (fromIndex, toIndex) => createQuery().range(fromIndex, toIndex),
        'community projects',
    );
    return { rows, errorMessage };
}

async function loadVisibleCommunityProjectRows(
    supabase: SupabaseClient,
    communityParticipant: WorkshopParticipant | null,
    limit: number | null,
): Promise<CommunityProjectRowsResult> {
    const approvedProjectsResult = await loadCommunityProjectRowsByStatus(supabase, 'approved', null, limit);
    if (approvedProjectsResult.rows === null) {
        return approvedProjectsResult;
    }
    if (communityParticipant === null) {
        return approvedProjectsResult;
    }

    // Pending cards mirror pending chat messages: the author sees their own, while a community moderator sees the
    // queue. They are kept separate from the compact approved-card limit, so a draft never hides a shared project.
    const pendingProjectsResult = await loadCommunityProjectRowsByStatus(
        supabase,
        'pending',
        getPendingProjectAuthorParticipantId(communityParticipant),
        limit === null ? null : MAXIMAL_VISIBLE_PENDING_COMMUNITY_PROJECT_COUNT,
    );
    if (pendingProjectsResult.rows === null) {
        return pendingProjectsResult;
    }

    return { rows: [...approvedProjectsResult.rows, ...pendingProjectsResult.rows], errorMessage: null };
}

async function loadCommunityProjectAuthors(
    supabase: SupabaseClient,
    authorParticipantIds: readonly string[],
): Promise<{ readonly authorNameById: ReadonlyMap<string, string>; readonly errorMessage: string | null }> {
    const distinctAuthorParticipantIds = Array.from(new Set(authorParticipantIds));
    const authorNameById = new Map<string, string>();

    for (const authorParticipantIdChunk of getProjectIdChunks(distinctAuthorParticipantIds)) {
        const { data, error } = await supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id, fullname')
            .in('id', authorParticipantIdChunk);
        if (error) {
            return { authorNameById, errorMessage: error.message };
        }

        ((data ?? []) as readonly CommunityProjectAuthorRow[]).forEach((author) => {
            authorNameById.set(author.id, author.fullname);
        });
    }

    return { authorNameById, errorMessage: null };
}

async function loadCommunityProjectVotes(
    supabase: SupabaseClient,
    projectIds: readonly string[],
    communityParticipantId: string | null,
): Promise<{ readonly voteByProjectId: ReadonlyMap<string, CommunityProjectVote>; readonly errorMessage: string | null }> {
    const voteByProjectId = new Map<string, CommunityProjectVote>();
    if (communityParticipantId === null || projectIds.length === 0) {
        return { voteByProjectId, errorMessage: null };
    }

    for (const projectIdChunk of getProjectIdChunks(projectIds)) {
        const { data, error } = await supabase
            .from(COMMUNITY_PROJECT_VOTE_TABLE_NAME)
            .select('project_id, vote')
            .eq('community_participant_id', communityParticipantId)
            .in('project_id', projectIdChunk);
        if (error) {
            return { voteByProjectId, errorMessage: error.message };
        }

        ((data ?? []) as readonly CommunityProjectVoteRow[]).forEach((projectVote) => {
            const vote = getCommunityProjectVoteFromDatabaseValue(projectVote.vote);
            if (vote !== null) {
                voteByProjectId.set(projectVote.project_id, vote);
            }
        });
    }

    return { voteByProjectId, errorMessage: null };
}

async function loadDiscussionWorkshopSlugs(
    supabase: SupabaseClient,
    discussionWorkshopIds: readonly string[],
): Promise<{ readonly slugById: ReadonlyMap<string, string>; readonly errorMessage: string | null }> {
    const slugById = new Map<string, string>();
    for (const discussionWorkshopIdChunk of getProjectIdChunks(discussionWorkshopIds)) {
        const { data, error } = await supabase
            .from('workshops')
            .select('id, slug')
            .in('id', discussionWorkshopIdChunk)
            .eq('room_kind', 'project');
        if (error) {
            return { slugById, errorMessage: error.message };
        }

        ((data ?? []) as readonly CommunityProjectDiscussionRow[]).forEach((discussionWorkshop) => {
            slugById.set(discussionWorkshop.id, discussionWorkshop.slug);
        });
    }

    return { slugById, errorMessage: null };
}

async function mapCommunityProjectRows(
    supabase: SupabaseClient,
    projectRows: readonly CommunityProjectRow[],
    communityParticipantId: string | null,
): Promise<{ readonly projects: readonly CommunityProject[] | null; readonly errorMessage: string | null }> {
    if (projectRows.length === 0) {
        return { projects: [], errorMessage: null };
    }

    const [authorsResult, votesResult, discussionsResult] = await Promise.all([
        loadCommunityProjectAuthors(
            supabase,
            projectRows.map((projectRow) => projectRow.author_community_participant_id),
        ),
        loadCommunityProjectVotes(
            supabase,
            projectRows.map((projectRow) => projectRow.id),
            communityParticipantId,
        ),
        loadDiscussionWorkshopSlugs(
            supabase,
            projectRows.map((projectRow) => projectRow.discussion_workshop_id),
        ),
    ]);
    const errorMessage = authorsResult.errorMessage ?? votesResult.errorMessage ?? discussionsResult.errorMessage;
    if (errorMessage !== null) {
        return { projects: null, errorMessage };
    }

    return {
        projects: projectRows
            .map((projectRow): CommunityProject | null => {
                const discussionWorkshopSlug = discussionsResult.slugById.get(projectRow.discussion_workshop_id);
                if (discussionWorkshopSlug === undefined) {
                    return null;
                }

                return {
                    id: projectRow.id,
                    url: projectRow.url,
                    title: projectRow.title,
                    description: projectRow.description,
                    previewImageUrl: projectRow.preview_image_url,
                    status: projectRow.status,
                    authorName: authorsResult.authorNameById.get(projectRow.author_community_participant_id) ?? 'Člen komunity',
                    upvoteCount: projectRow.upvote_count,
                    downvoteCount: projectRow.downvote_count,
                    voteByParticipant: votesResult.voteByProjectId.get(projectRow.id) ?? null,
                    discussionWorkshopSlug,
                    createdAt: projectRow.created_at,
                };
            })
            .filter((project): project is CommunityProject => project !== null),
        errorMessage: null,
    };
}

/**
 * Lists approved cards by their positive vote total. A participant receives their own pending project as well, while
 * a moderator receives the pending queue; rejected cards never return to the community surface.
 */
export async function loadCommunityProjects(
    supabase: SupabaseClient,
    communityParticipant: WorkshopParticipant | null,
    limit: number | null,
): Promise<{ readonly projects: readonly CommunityProject[] | null; readonly errorMessage: string | null }> {
    const visibleProjectRows = await loadVisibleCommunityProjectRows(supabase, communityParticipant, limit);
    if (visibleProjectRows.rows === null) {
        return { projects: null, errorMessage: visibleProjectRows.errorMessage };
    }

    return mapCommunityProjectRows(supabase, visibleProjectRows.rows, communityParticipant?.id ?? null);
}

/**
 * The administration may explicitly read one status at a time, including rejected cards which stay out of the
 * community room. It reuses the ordinary card projection so author and discussion data never have a second mapper.
 */
export async function loadAdminCommunityProjects(
    supabase: SupabaseClient,
    status: WorkshopSubmissionStatus,
): Promise<{ readonly projects: readonly CommunityProject[] | null; readonly errorMessage: string | null }> {
    const projectRowsResult = await loadCommunityProjectRowsByStatus(supabase, status, null, null);
    if (projectRowsResult.rows === null) {
        return { projects: null, errorMessage: projectRowsResult.errorMessage };
    }

    return mapCommunityProjectRows(supabase, projectRowsResult.rows, null);
}

export async function loadCommunityProjectById(
    supabase: SupabaseClient,
    projectId: string,
    communityParticipant: WorkshopParticipant | null,
): Promise<{ readonly project: CommunityProject | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_PROJECT_TABLE_NAME)
        .select(COMMUNITY_PROJECT_COLUMNS)
        .eq('id', projectId)
        .maybeSingle();
    if (error) {
        return { project: null, errorMessage: error.message };
    }
    if (data === null) {
        return { project: null, errorMessage: null };
    }

    const projectRow = data as CommunityProjectRow;
    if (!isCommunityProjectVisibleToParticipant(projectRow, communityParticipant)) {
        return { project: null, errorMessage: null };
    }

    const mappedProjects = await mapCommunityProjectRows(
        supabase,
        [projectRow],
        communityParticipant?.id ?? null,
    );
    return { project: mappedProjects.projects?.[0] ?? null, errorMessage: mappedProjects.errorMessage };
}
