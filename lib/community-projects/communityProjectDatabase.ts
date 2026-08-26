import {
    COMMUNITY_PROJECT_VOTE_VALUES,
    type CommunityProject,
    type CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import type { SupabaseClient } from '@supabase/supabase-js';

const COMMUNITY_PROJECT_TABLE_NAME = 'community_projects';
const COMMUNITY_PROJECT_VOTE_TABLE_NAME = 'community_project_votes';
const COMMUNITY_PROJECT_COLUMNS =
    'id, author_community_participant_id, discussion_workshop_id, url, title, description, preview_image_url, upvote_count, downvote_count, created_at';
const COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE = 500;

type CommunityProjectRow = {
    readonly id: string;
    readonly author_community_participant_id: string;
    readonly discussion_workshop_id: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly preview_image_url: string | null;
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

type CreatedCommunityProjectRow = {
    readonly project_id: string;
};

type CommunityProjectDiscussionConnectionRow = {
    readonly discussion_workshop_id: string;
    readonly discussion_workshop_slug: string;
    readonly discussion_participant_id: string;
};

type CommunityProjectVoteResultRow = {
    readonly vote: number | null;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

function getCommunityProjectVote(value: number | null): CommunityProjectVote | null {
    return value === 1 ? 'up' : value === -1 ? 'down' : null;
}

function getProjectIdChunks(projectIds: readonly string[]): readonly string[][] {
    const chunks: string[][] = [];
    for (let fromIndex = 0; fromIndex < projectIds.length; fromIndex += COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE) {
        chunks.push(projectIds.slice(fromIndex, fromIndex + COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE));
    }

    return chunks;
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
            const vote = getCommunityProjectVote(projectVote.vote);
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
 * Lists cards by their positive vote total. A deterministic creation-time tie-breaker keeps the home and the full
 * catalogue in the same order when two projects have equal support.
 */
export async function loadCommunityProjects(
    supabase: SupabaseClient,
    communityParticipantId: string | null,
    limit: number | null,
): Promise<{ readonly projects: readonly CommunityProject[] | null; readonly errorMessage: string | null }> {
    if (limit !== null) {
        const { data, error } = await supabase
            .from(COMMUNITY_PROJECT_TABLE_NAME)
            .select(COMMUNITY_PROJECT_COLUMNS)
            .order('upvote_count', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            return { projects: null, errorMessage: error.message };
        }

        return mapCommunityProjectRows(supabase, (data ?? []) as readonly CommunityProjectRow[], communityParticipantId);
    }

    const { rows, errorMessage } = await loadAllSupabaseRows<CommunityProjectRow>(
        (fromIndex, toIndex) =>
            supabase
                .from(COMMUNITY_PROJECT_TABLE_NAME)
                .select(COMMUNITY_PROJECT_COLUMNS)
                .order('upvote_count', { ascending: false })
                .order('created_at', { ascending: false })
                .range(fromIndex, toIndex),
        'community projects',
    );
    if (rows === null) {
        return { projects: null, errorMessage };
    }

    return mapCommunityProjectRows(supabase, rows, communityParticipantId);
}

export async function loadCommunityProjectById(
    supabase: SupabaseClient,
    projectId: string,
    communityParticipantId: string | null,
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

    const mappedProjects = await mapCommunityProjectRows(
        supabase,
        [data as CommunityProjectRow],
        communityParticipantId,
    );
    return { project: mappedProjects.projects?.[0] ?? null, errorMessage: mappedProjects.errorMessage };
}

export async function createCommunityProject(
    supabase: SupabaseClient,
    values: {
        readonly communityParticipantId: string;
        readonly url: string;
        readonly title: string;
        readonly description: string;
        readonly previewImageUrl: string | null;
    },
): Promise<{ readonly projectId: string | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase.rpc('create_community_project', {
        target_community_participant_id: values.communityParticipantId,
        target_url: values.url,
        target_title: values.title,
        target_description: values.description,
        target_preview_image_url: values.previewImageUrl,
    });
    if (error) {
        return { projectId: null, errorMessage: error.message };
    }

    const projectId = ((data ?? []) as readonly CreatedCommunityProjectRow[])[0]?.project_id ?? null;
    return projectId === null
        ? { projectId: null, errorMessage: 'Community project could not be created' }
        : { projectId, errorMessage: null };
}

export async function connectCommunityProjectDiscussion(
    supabase: SupabaseClient,
    projectId: string,
    communityParticipantId: string,
): Promise<{
    readonly connection: CommunityProjectDiscussionConnectionRow | null;
    readonly errorMessage: string | null;
}> {
    const { data, error } = await supabase.rpc('connect_community_project_discussion', {
        target_project_id: projectId,
        target_community_participant_id: communityParticipantId,
    });
    if (error) {
        return { connection: null, errorMessage: error.message };
    }

    const connection = ((data ?? []) as readonly CommunityProjectDiscussionConnectionRow[])[0] ?? null;
    return connection === null
        ? { connection: null, errorMessage: 'Community project discussion could not be connected' }
        : { connection, errorMessage: null };
}

export async function setCommunityProjectVote(
    supabase: SupabaseClient,
    projectId: string,
    communityParticipantId: string,
    vote: CommunityProjectVote,
): Promise<{
    readonly result: {
        readonly vote: CommunityProjectVote | null;
        readonly upvoteCount: number;
        readonly downvoteCount: number;
    } | null;
    readonly errorMessage: string | null;
}> {
    const databaseVote = vote === COMMUNITY_PROJECT_VOTE_VALUES[0] ? 1 : -1;
    const { data, error } = await supabase.rpc('set_community_project_vote', {
        target_project_id: projectId,
        target_community_participant_id: communityParticipantId,
        target_vote: databaseVote,
    });
    if (error) {
        return { result: null, errorMessage: error.message };
    }

    const result = ((data ?? []) as readonly CommunityProjectVoteResultRow[])[0] ?? null;
    if (result === null) {
        return { result: null, errorMessage: 'Community project vote could not be saved' };
    }

    return {
        result: {
            vote: getCommunityProjectVote(result.vote),
            upvoteCount: result.upvote_count,
            downvoteCount: result.downvote_count,
        },
        errorMessage: null,
    };
}
