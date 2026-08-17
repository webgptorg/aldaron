import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import {
    MAXIMAL_RECENT_REACTION_COUNT,
    MAXIMAL_VISIBLE_COMMENT_COUNT,
    WORKSHOP_COMMENT_TABLE_NAME,
    WORKSHOP_CONTENT_TABLE_NAME,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_REACTION_TABLE_NAME,
    WORKSHOP_TABLE_NAME,
    WORKSHOP_UPVOTE_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import type {
    WorkshopAdminComment,
    WorkshopAdminSnapshot,
    WorkshopComment,
    WorkshopCommentSort,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopParticipant,
    WorkshopPublicState,
    WorkshopReaction,
    WorkshopSummary,
} from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type WorkshopRow = {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly starts_at: string;
    readonly ends_at: string | null;
    readonly youtube_video_id: string | null;
    readonly is_published: boolean;
    readonly allowed_reactions: string[];
    readonly created_at: string;
    readonly updated_at: string;
};

type WorkshopContentRow = {
    readonly id: string;
    readonly title: string;
    readonly body_markdown: string;
    readonly unlock_at: string;
    readonly sort_order: number;
    readonly is_published: boolean;
    readonly created_at: string;
    readonly updated_at: string;
};

type WorkshopCommentRow = {
    readonly id: string;
    readonly participant_id: string;
    readonly author_name: string;
    readonly body: string;
    readonly status: 'pending' | 'approved' | 'rejected';
    readonly upvote_count: number;
    readonly created_at: string;
};

type WorkshopReactionRow = {
    readonly id: string;
    readonly emoji: string;
    readonly created_at: string;
};

const WORKSHOP_DATABASE_UNAVAILABLE_MESSAGE = 'Workshop database is not configured';
const MAXIMAL_ADMIN_PENDING_COMMENT_COUNT = 1_000;
const MAXIMAL_ADMIN_MODERATED_COMMENT_COUNT = 300;

export function getWorkshopDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export function createWorkshopDatabaseUnavailableResponse(): NextResponse {
    console.error('The workshop database needs SUPABASE_SERVICE_ROLE_KEY because all workshop tables are RLS secured.');
    return NextResponse.json({ error: WORKSHOP_DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
}

export function mapWorkshopRow(row: WorkshopRow): WorkshopDetails {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        youtubeVideoId: row.youtube_video_id,
        isPublished: row.is_published,
        allowedReactions: row.allowed_reactions,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapWorkshopSummaryRow(row: WorkshopRow): WorkshopSummary {
    const workshop = mapWorkshopRow(row);
    return {
        id: workshop.id,
        slug: workshop.slug,
        title: workshop.title,
        startsAt: workshop.startsAt,
        endsAt: workshop.endsAt,
        isPublished: workshop.isPublished,
    };
}

export function mapWorkshopContentRow(row: WorkshopContentRow): WorkshopContentBlock {
    return {
        id: row.id,
        title: row.title,
        bodyMarkdown: row.body_markdown,
        unlockAt: row.unlock_at,
        sortOrder: row.sort_order,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapWorkshopCommentRow(row: WorkshopCommentRow, isUpvotedByParticipant: boolean): WorkshopComment {
    return {
        id: row.id,
        authorName: row.author_name,
        body: row.body,
        status: row.status,
        upvoteCount: row.upvote_count,
        isUpvotedByParticipant,
        createdAt: row.created_at,
    };
}

export function mapWorkshopReactionRow(row: WorkshopReactionRow): WorkshopReaction {
    return { id: row.id, emoji: row.emoji, createdAt: row.created_at };
}

export async function findWorkshopBySlug(
    supabase: SupabaseClient,
    workshopSlug: string,
    isPublishedRequired: boolean,
): Promise<WorkshopRow | null> {
    let workshopQuery = supabase.from(WORKSHOP_TABLE_NAME).select('*').eq('slug', workshopSlug);

    if (isPublishedRequired) {
        workshopQuery = workshopQuery.eq('is_published', true);
    }

    const { data, error } = await workshopQuery.maybeSingle();
    if (error) {
        console.error(`Failed to load workshop "${workshopSlug}":`, error.message);
        return null;
    }

    return data as WorkshopRow | null;
}

export async function findWorkshopById(supabase: SupabaseClient, workshopId: string): Promise<WorkshopRow | null> {
    const { data, error } = await supabase.from(WORKSHOP_TABLE_NAME).select('*').eq('id', workshopId).maybeSingle();
    if (error) {
        console.error(`Failed to load workshop "${workshopId}":`, error.message);
        return null;
    }

    return data as WorkshopRow | null;
}

type LoadedWorkshopPublicState = {
    readonly state: WorkshopPublicState | null;
    readonly errorMessage: string | null;
};

export async function loadWorkshopPublicState(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    commentSort: WorkshopCommentSort,
): Promise<LoadedWorkshopPublicState> {
    const contentVisibilityCutoff = new Date().toISOString();
    let commentsQuery = supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, participant_id, author_name, body, status, upvote_count, created_at')
        .eq('workshop_id', workshopRow.id)
        .eq('status', 'approved')
        .limit(MAXIMAL_VISIBLE_COMMENT_COUNT);

    commentsQuery =
        commentSort === 'upvotes'
            ? commentsQuery.order('upvote_count', { ascending: false }).order('created_at', { ascending: false })
            : commentsQuery.order('created_at', { ascending: false });

    const [contentResult, nextUnlockResult, commentsResult, reactionsResult] = await Promise.all([
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select('id, title, body_markdown, unlock_at, sort_order, is_published, created_at, updated_at')
            .eq('workshop_id', workshopRow.id)
            .eq('is_published', true)
            .lte('unlock_at', contentVisibilityCutoff)
            .order('sort_order', { ascending: true })
            .order('unlock_at', { ascending: true }),
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select('unlock_at')
            .eq('workshop_id', workshopRow.id)
            .eq('is_published', true)
            .gt('unlock_at', contentVisibilityCutoff)
            .order('unlock_at', { ascending: true })
            .limit(1)
            .maybeSingle(),
        commentsQuery,
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id, emoji, created_at')
            .eq('workshop_id', workshopRow.id)
            .order('created_at', { ascending: false })
            .limit(MAXIMAL_RECENT_REACTION_COUNT),
    ]);

    const firstError = contentResult.error ?? nextUnlockResult.error ?? commentsResult.error ?? reactionsResult.error;
    if (firstError) {
        return { state: null, errorMessage: firstError.message };
    }

    const commentRows = (commentsResult.data ?? []) as WorkshopCommentRow[];
    const commentIds = commentRows.map(({ id }) => id);
    let upvotedCommentIds = new Set<string>();

    if (commentIds.length > 0) {
        const { data: upvoteRows, error: upvoteError } = await supabase
            .from(WORKSHOP_UPVOTE_TABLE_NAME)
            .select('comment_id')
            .eq('workshop_id', workshopRow.id)
            .eq('participant_id', participant.id)
            .in('comment_id', commentIds);

        if (upvoteError) {
            return { state: null, errorMessage: upvoteError.message };
        }

        upvotedCommentIds = new Set((upvoteRows ?? []).map(({ comment_id }) => comment_id as string));
    }

    return {
        state: {
            serverTime: new Date().toISOString(),
            workshop: mapWorkshopRow(workshopRow),
            participant,
            contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map(mapWorkshopContentRow),
            nextContentUnlockAt: (nextUnlockResult.data?.unlock_at as string | undefined) ?? null,
            comments: commentRows.map((row) => mapWorkshopCommentRow(row, upvotedCommentIds.has(row.id))),
            recentReactions: ((reactionsResult.data ?? []) as WorkshopReactionRow[]).map(mapWorkshopReactionRow),
        },
        errorMessage: null,
    };
}

export async function loadWorkshopAdminSnapshot(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<{ readonly snapshot: WorkshopAdminSnapshot | null; readonly errorMessage: string | null }> {
    const [
        contentResult,
        pendingCommentsResult,
        moderatedCommentsResult,
        commentsCountResult,
        participantsResult,
        reactionsResult,
    ] = await Promise.all([
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select('id, title, body_markdown, unlock_at, sort_order, is_published, created_at, updated_at')
            .eq('workshop_id', workshopRow.id)
            .order('sort_order', { ascending: true })
            .order('unlock_at', { ascending: true }),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id, participant_id, author_name, body, status, upvote_count, created_at')
            .eq('workshop_id', workshopRow.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(MAXIMAL_ADMIN_PENDING_COMMENT_COUNT),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id, participant_id, author_name, body, status, upvote_count, created_at')
            .eq('workshop_id', workshopRow.id)
            .in('status', ['approved', 'rejected'])
            .order('created_at', { ascending: false })
            .limit(MAXIMAL_ADMIN_MODERATED_COMMENT_COUNT),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
    ]);

    const firstError =
        contentResult.error ??
        pendingCommentsResult.error ??
        moderatedCommentsResult.error ??
        commentsCountResult.error ??
        participantsResult.error ??
        reactionsResult.error;
    if (firstError) {
        return { snapshot: null, errorMessage: firstError.message };
    }

    const commentRows = [
        ...((pendingCommentsResult.data ?? []) as WorkshopCommentRow[]),
        ...((moderatedCommentsResult.data ?? []) as WorkshopCommentRow[]),
    ];
    const comments = commentRows.map((row): WorkshopAdminComment => ({
        ...mapWorkshopCommentRow(row, false),
        participantId: row.participant_id,
    }));

    return {
        snapshot: {
            workshop: mapWorkshopRow(workshopRow),
            contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map(mapWorkshopContentRow),
            comments,
            participantCount: participantsResult.count ?? 0,
            commentCount: commentsCountResult.count ?? 0,
            reactionCount: reactionsResult.count ?? 0,
        },
        errorMessage: null,
    };
}
