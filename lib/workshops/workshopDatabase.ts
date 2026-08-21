import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import {
    MAXIMAL_ADMIN_PARTICIPANT_LIST_COUNT,
    MAXIMAL_RECENT_REACTION_COUNT,
    MAXIMAL_VISIBLE_COMMENT_COUNT,
    MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT,
    WORKSHOP_COMMENT_TABLE_NAME,
    WORKSHOP_CONTENT_TABLE_NAME,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_REACTION_TABLE_NAME,
    WORKSHOP_TABLE_NAME,
    WORKSHOP_UPVOTE_TABLE_NAME,
    WORKSHOP_WATCHING_WINDOW_SECONDS,
} from '@/lib/workshops/workshopConstants';
import { getDisplayedWorkshopCommentUpvoteCount, sortWorkshopComments } from '@/lib/workshops/workshopCommentValues';
import { isWorkshopPanelEnabled, normalizeWorkshopDisabledPanels } from '@/lib/workshops/workshopPanels';
import type {
    WorkshopAdminComment,
    WorkshopAdminParticipant,
    WorkshopAdminSnapshot,
    WorkshopComment,
    WorkshopCommentReference,
    WorkshopCommentSort,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopParticipant,
    WorkshopPublicState,
    WorkshopReaction,
    WorkshopReactionCount,
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

    /**
     * The keys of the panels this workshop switched off for its participants
     */
    readonly disabled_panels: string[];

    /**
     * The message pinned on top of the chat of this workshop, or `null` when nothing is pinned
     */
    readonly pinned_comment_id: string | null;
    readonly created_at: string;
    readonly updated_at: string;
};

type WorkshopSummaryRow = Pick<WorkshopRow, 'id' | 'slug' | 'title' | 'starts_at' | 'ends_at' | 'is_published'>;

/**
 * Fields the public list and the administration selector need to identify one occurrence without exposing its live
 * room configuration.
 */
export const WORKSHOP_SUMMARY_COLUMNS = 'id, slug, title, starts_at, ends_at, is_published';

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

export type WorkshopCommentRow = {
    readonly id: string;
    readonly participant_id: string | null;
    readonly parent_comment_id: string | null;
    readonly author_name: string;
    readonly body: string;
    readonly status: 'pending' | 'approved' | 'rejected';
    readonly upvote_count: number;
    readonly artificial_upvote_count: number;
    readonly is_artificial: boolean;
    readonly created_at: string;
};

/**
 * Everything a `WorkshopCommentRow` needs, so that a new comment field is selected everywhere at once
 */
export const WORKSHOP_COMMENT_COLUMNS =
    'id, participant_id, parent_comment_id, author_name, body, status, upvote_count, artificial_upvote_count, is_artificial, created_at';

type WorkshopCommentReferenceRow = {
    readonly id: string;
    readonly author_name: string;
    readonly body: string;
};

/**
 * As little of a comment as it takes to recognize it outside of the chat, so in the moderation of a reply or in the
 * pinned message of the administration
 */
const WORKSHOP_COMMENT_REFERENCE_COLUMNS = 'id, author_name, body';

type WorkshopAdminParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly email: string;
    readonly connected_at: string;
    readonly last_seen_at: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly active_duration_seconds: number;
};

type WorkshopParticipantActivityTotalsRow = {
    readonly participant_id: string;
    readonly comment_count: number | string;
    readonly reaction_count: number | string;
    readonly link_click_count: number | string;
    readonly upvote_count: number | string;
};

type WorkshopContentLinkClickTotalsRow = {
    readonly content_block_id: string;
    readonly link_click_count: number | string;
};

type WorkshopReactionRow = {
    readonly id: string;
    readonly emoji: string;
    readonly created_at: string;
};

type WorkshopReactionCountRow = {
    readonly emoji: string;
    readonly reaction_count: number | string;
};

type CreatedWorkshopReactionRow = WorkshopReactionRow & {
    readonly reaction_count: number | string;
};

const WORKSHOP_DATABASE_UNAVAILABLE_MESSAGE = 'Workshop database is not configured';
const MAXIMAL_ADMIN_COMMENT_LIST_COUNT = 1_000;

function getNonNegativeWholeNumber(value: number | string | undefined): number {
    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue) && numberValue >= 0 ? numberValue : 0;
}

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
        disabledPanels: normalizeWorkshopDisabledPanels(row.disabled_panels),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapWorkshopSummaryRow(row: WorkshopSummaryRow): WorkshopSummary {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        isPublished: row.is_published,
    };
}

export function mapWorkshopContentRow(row: WorkshopContentRow, linkClickCount = 0): WorkshopContentBlock {
    return {
        id: row.id,
        title: row.title,
        bodyMarkdown: row.body_markdown,
        unlockAt: row.unlock_at,
        sortOrder: row.sort_order,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        linkClickCount,
    };
}

export function mapWorkshopCommentRow(
    row: WorkshopCommentRow,
    isUpvotedByParticipant: boolean,
    pinnedCommentId: string | null,
): WorkshopComment {
    return {
        id: row.id,
        authorName: row.author_name,
        body: row.body,
        status: row.status,
        upvoteCount: getDisplayedWorkshopCommentUpvoteCount(row.upvote_count, row.artificial_upvote_count),
        isUpvotedByParticipant,
        createdAt: row.created_at,
        parentCommentId: row.parent_comment_id,
        isPinned: row.id === pinnedCommentId,
    };
}

function mapWorkshopCommentReferenceRow(row: WorkshopCommentReferenceRow): WorkshopCommentReference {
    return { id: row.id, authorName: row.author_name, body: row.body };
}

function mapWorkshopAdminParticipantRow(
    row: WorkshopAdminParticipantRow,
    activityTotals: WorkshopParticipantActivityTotalsRow | undefined,
): WorkshopAdminParticipant {
    return {
        id: row.id,
        fullname: row.fullname,
        email: row.email,
        connectedAt: row.connected_at,
        lastSeenAt: row.last_seen_at,
        isInteractionBanned: row.is_interaction_banned,
        isTrusted: row.is_trusted,
        activeDurationSeconds: getNonNegativeWholeNumber(row.active_duration_seconds),
        commentCount: getNonNegativeWholeNumber(activityTotals?.comment_count),
        reactionCount: getNonNegativeWholeNumber(activityTotals?.reaction_count),
        linkClickCount: getNonNegativeWholeNumber(activityTotals?.link_click_count),
        upvoteCount: getNonNegativeWholeNumber(activityTotals?.upvote_count),
    };
}

export function mapWorkshopReactionRow(row: WorkshopReactionRow): WorkshopReaction {
    return { id: row.id, emoji: row.emoji, createdAt: row.created_at };
}

function mapWorkshopReactionCountRow(row: WorkshopReactionCountRow): WorkshopReactionCount {
    return { emoji: row.emoji, count: getNonNegativeWholeNumber(row.reaction_count) };
}

/**
 * Stores one reaction and returns the total for its exact text as one atomic database operation
 *
 * Note: The total travels with the persisted reaction rather than being incremented in a browser. That keeps every
 *       room correct when several participants react at once, when a room reconnects, or when its own broadcast comes
 *       back to it.
 */
export async function createWorkshopReaction(
    supabase: SupabaseClient,
    workshopId: string,
    participantId: string | null,
    emoji: string,
): Promise<
    | { readonly reaction: WorkshopReaction; readonly reactionCount: number; readonly errorMessage: null }
    | { readonly reaction: null; readonly reactionCount: null; readonly errorMessage: string }
> {
    const { data, error } = await supabase.rpc('create_workshop_reaction', {
        target_workshop_id: workshopId,
        target_participant_id: participantId,
        target_emoji: emoji,
    });
    const createdReactionRow = (data as readonly CreatedWorkshopReactionRow[] | null)?.[0];
    if (error || createdReactionRow === undefined) {
        return {
            reaction: null,
            reactionCount: null,
            errorMessage: error?.message ?? 'No reaction returned',
        };
    }

    return {
        reaction: mapWorkshopReactionRow(createdReactionRow),
        reactionCount: getNonNegativeWholeNumber(createdReactionRow.reaction_count),
        errorMessage: null,
    };
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

/**
 * Lists terms which have not started yet in chronological order, which is the order visitors should choose from on
 * the landing page.
 */
export async function findUpcomingPublishedWorkshops(
    supabase: SupabaseClient,
    currentTime = new Date().toISOString(),
): Promise<readonly WorkshopSummaryRow[]> {
    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select(WORKSHOP_SUMMARY_COLUMNS)
        .eq('is_published', true)
        .gt('starts_at', currentTime)
        .order('starts_at', { ascending: true });

    if (error) {
        console.error('Failed to load upcoming workshops:', error.message);
        return [];
    }

    return (data ?? []) as WorkshopSummaryRow[];
}

/**
 * Resolves legacy public URLs which did not name an occurrence to the workshop with the newest start date.
 */
export async function findMostRecentPublishedWorkshop(supabase: SupabaseClient): Promise<WorkshopRow | null> {
    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select('*')
        .eq('is_published', true)
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Failed to load the most recent workshop:', error.message);
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

/**
 * Counts the participants whose browser talked to the room within the watching window
 *
 * Note: Every authenticated request refreshes `last_seen_at`, so an open room keeps itself in this count through its
 *       presence reports and state reloads, while a closed one falls out of it once the window passes.
 * Note: A room which does not show the count does not pay for it. Every state reload and every heartbeat of every
 *       participant would otherwise count the whole audience for nobody to read.
 * Note: An unavailable count must never take the whole room down with it, so a failure is reported as nobody watching.
 */
export async function countWatchingWorkshopParticipants(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<number> {
    if (!isWorkshopPanelEnabled(workshopRow.disabled_panels, 'watching-count')) {
        return 0;
    }

    const watchingSince = new Date(Date.now() - WORKSHOP_WATCHING_WINDOW_SECONDS * 1_000).toISOString();
    const { count, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select('id', { count: 'exact', head: true })
        .eq('workshop_id', workshopRow.id)
        .gte('last_seen_at', watchingSince);

    if (error) {
        console.error('Failed to count the participants watching a workshop:', error.message);
        return 0;
    }

    return count ?? 0;
}

type LoadedWorkshopReactionCounts = {
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly errorMessage: string | null;
};

/**
 * Loads the totals shown beside the reactions which a room currently offers
 *
 * Note: When the reactions panel is hidden, nobody can read these totals. Skipping the aggregation then keeps an
 *       unused panel from making every room refresh more expensive.
 */
async function loadWorkshopReactionCounts(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<LoadedWorkshopReactionCounts> {
    if (!isWorkshopPanelEnabled(workshopRow.disabled_panels, 'reactions')) {
        return { reactionCounts: [], errorMessage: null };
    }

    const { data, error } = await supabase.rpc('get_workshop_reaction_counts', {
        target_workshop_id: workshopRow.id,
    });
    if (error) {
        return { reactionCounts: [], errorMessage: error.message };
    }

    return {
        reactionCounts: ((data ?? []) as WorkshopReactionCountRow[]).map(mapWorkshopReactionCountRow),
        errorMessage: null,
    };
}

/**
 * Loads the message pinned on top of a chat, whatever its age and moderation state
 *
 * Note: The pin belongs to the workshop, so the pinned message can be far outside the recent ones and still has to
 *       reach both the room and the administration.
 * Note: A pin which could not be loaded must never take the whole room down with it, so a failure is reported as
 *       nothing being pinned.
 */
async function loadPinnedWorkshopCommentRowOrNull(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<WorkshopCommentRow | null> {
    if (workshopRow.pinned_comment_id === null) {
        return null;
    }

    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('id', workshopRow.pinned_comment_id)
        .eq('workshop_id', workshopRow.id)
        .maybeSingle();

    if (error) {
        console.error('Failed to load the pinned comment of a workshop:', error.message);
        return null;
    }

    return data as WorkshopCommentRow | null;
}

/**
 * Adds the pinned message to the loaded ones, so the room keeps a pin on top however old it is
 *
 * Note: Only a message the whole room sees can hold the top of the chat, so a pin which lost its approval is left out.
 */
function withPinnedWorkshopCommentRow(
    commentRows: readonly WorkshopCommentRow[],
    pinnedCommentRow: WorkshopCommentRow | null,
): readonly WorkshopCommentRow[] {
    if (
        pinnedCommentRow === null ||
        pinnedCommentRow.status !== 'approved' ||
        commentRows.some(({ id }) => id === pinnedCommentRow.id)
    ) {
        return commentRows;
    }

    return [...commentRows, pinnedCommentRow];
}

/**
 * Pins one message on top of a chat or releases the top of that chat again
 *
 * Note: The workshop remembers a single pin, so pinning a message releases the previously pinned one in the same write.
 * Note: Releasing the top only clears this very message, so it never drops a pin which another tab set meanwhile.
 */
export async function updatePinnedWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    isPinned: boolean,
): Promise<{ readonly errorMessage: string | null }> {
    const pinnedCommentQuery = supabase
        .from(WORKSHOP_TABLE_NAME)
        .update({ pinned_comment_id: isPinned ? commentId : null })
        .eq('id', workshopId);

    const { error } = await (isPinned ? pinnedCommentQuery : pinnedCommentQuery.eq('pinned_comment_id', commentId));
    if (error) {
        console.error('Failed to change the pinned comment of a workshop:', error.message);
        return { errorMessage: 'Pinned comment could not be changed' };
    }

    return { errorMessage: null };
}

export async function loadWorkshopPublicState(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    commentSort: WorkshopCommentSort,
): Promise<LoadedWorkshopPublicState> {
    const contentVisibilityCutoff = new Date().toISOString();
    const commentsQuery = supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(MAXIMAL_VISIBLE_COMMENT_COUNT);

    const [
        contentResult,
        nextUnlockResult,
        commentsResult,
        pendingCommentsResult,
        reactionsResult,
        reactionCountsResult,
        watchingParticipantCount,
        pinnedCommentRow,
    ] = await Promise.all([
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
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select(WORKSHOP_COMMENT_COLUMNS)
            .eq('workshop_id', workshopRow.id)
            .eq('participant_id', participant.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT),
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id, emoji, created_at')
            .eq('workshop_id', workshopRow.id)
            .order('created_at', { ascending: false })
            .limit(MAXIMAL_RECENT_REACTION_COUNT),
        loadWorkshopReactionCounts(supabase, workshopRow),
        countWatchingWorkshopParticipants(supabase, workshopRow),
        loadPinnedWorkshopCommentRowOrNull(supabase, workshopRow),
    ]);

    const stateQueryError =
        contentResult.error ??
        nextUnlockResult.error ??
        commentsResult.error ??
        pendingCommentsResult.error ??
        reactionsResult.error;
    const errorMessage = stateQueryError?.message ?? reactionCountsResult.errorMessage;
    if (errorMessage !== null) {
        return { state: null, errorMessage };
    }

    const commentRows = withPinnedWorkshopCommentRow(
        [
            ...((commentsResult.data ?? []) as WorkshopCommentRow[]),
            ...((pendingCommentsResult.data ?? []) as WorkshopCommentRow[]),
        ],
        pinnedCommentRow,
    );
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
            watchingParticipantCount,
            contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map(mapWorkshopContentRow),
            nextContentUnlockAt: (nextUnlockResult.data?.unlock_at as string | undefined) ?? null,
            comments: sortWorkshopComments(
                commentRows.map((row) =>
                    mapWorkshopCommentRow(row, upvotedCommentIds.has(row.id), workshopRow.pinned_comment_id),
                ),
                commentSort,
            ),
            recentReactions: ((reactionsResult.data ?? []) as WorkshopReactionRow[]).map(mapWorkshopReactionRow),
            reactionCounts: reactionCountsResult.reactionCounts,
        },
        errorMessage: null,
    };
}

/**
 * Loads the comments answered by the listed ones, so moderation of a reply sees the question it answers
 *
 * Note: The listed comments are filtered by one moderation status, so an answered comment is almost never among them.
 * Note: Missing context must never take the whole administration down with it, so a failure is reported as no context.
 */
async function loadAnsweredWorkshopComments(
    supabase: SupabaseClient,
    workshopId: string,
    commentRows: readonly WorkshopCommentRow[],
): Promise<ReadonlyMap<string, WorkshopCommentReference>> {
    const answeredCommentIds = Array.from(
        new Set(
            commentRows
                .map((commentRow) => commentRow.parent_comment_id)
                .filter((parentCommentId): parentCommentId is string => parentCommentId !== null),
        ),
    );
    if (answeredCommentIds.length === 0) {
        return new Map();
    }

    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_REFERENCE_COLUMNS)
        .eq('workshop_id', workshopId)
        .in('id', answeredCommentIds);

    if (error) {
        console.error('Failed to load the answered comments of a workshop:', error.message);
        return new Map();
    }

    return new Map(
        ((data ?? []) as readonly WorkshopCommentReferenceRow[]).map(
            (commentRow) => [commentRow.id, mapWorkshopCommentReferenceRow(commentRow)] as const,
        ),
    );
}

export async function loadWorkshopAdminSnapshot(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    commentStatus: WorkshopCommentStatus,
): Promise<{ readonly snapshot: WorkshopAdminSnapshot | null; readonly errorMessage: string | null }> {
    const [
        contentResult,
        commentsResult,
        commentsCountResult,
        participantCountResult,
        participantsResult,
        participantActivityTotalsResult,
        contentLinkClickTotalsResult,
        reactionsResult,
        artificialReactionsResult,
        pinnedCommentRow,
    ] = await Promise.all([
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select('id, title, body_markdown, unlock_at, sort_order, is_published, created_at, updated_at')
            .eq('workshop_id', workshopRow.id)
            .order('sort_order', { ascending: true })
            .order('unlock_at', { ascending: true }),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select(WORKSHOP_COMMENT_COLUMNS)
            .eq('workshop_id', workshopRow.id)
            .eq('status', commentStatus)
            .order('created_at', { ascending: false })
            .limit(MAXIMAL_ADMIN_COMMENT_LIST_COUNT),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id, fullname, email, connected_at, last_seen_at, is_interaction_banned, is_trusted, active_duration_seconds')
            .eq('workshop_id', workshopRow.id)
            .order('connected_at', { ascending: false })
            .limit(MAXIMAL_ADMIN_PARTICIPANT_LIST_COUNT),
        supabase.rpc('get_workshop_participant_activity_totals', { target_workshop_id: workshopRow.id }),
        supabase.rpc('get_workshop_content_link_click_totals', { target_workshop_id: workshopRow.id }),
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id)
            .eq('is_artificial', true),
        loadPinnedWorkshopCommentRowOrNull(supabase, workshopRow),
    ]);

    const firstError =
        contentResult.error ??
        commentsResult.error ??
        commentsCountResult.error ??
        participantCountResult.error ??
        participantsResult.error ??
        participantActivityTotalsResult.error ??
        contentLinkClickTotalsResult.error ??
        reactionsResult.error ??
        artificialReactionsResult.error;
    if (firstError) {
        return { snapshot: null, errorMessage: firstError.message };
    }

    const commentRows = (commentsResult.data ?? []) as WorkshopCommentRow[];
    const answeredCommentById = await loadAnsweredWorkshopComments(supabase, workshopRow.id, commentRows);
    const comments = commentRows.map((row): WorkshopAdminComment => ({
        ...mapWorkshopCommentRow(row, false, workshopRow.pinned_comment_id),
        participantId: row.participant_id,
        isArtificial: row.is_artificial,
        realUpvoteCount: row.upvote_count,
        artificialUpvoteCount: row.artificial_upvote_count,
        parentComment:
            row.parent_comment_id === null ? null : (answeredCommentById.get(row.parent_comment_id) ?? null),
    }));
    const activityTotalsByParticipantId = new Map<string, WorkshopParticipantActivityTotalsRow>(
        ((participantActivityTotalsResult.data ?? []) as WorkshopParticipantActivityTotalsRow[]).map(
            (activityTotals) => [activityTotals.participant_id, activityTotals] as const,
        ),
    );
    const linkClickCountByContentBlockId = new Map<string, number>(
        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
            (linkClickTotals) =>
                [linkClickTotals.content_block_id, getNonNegativeWholeNumber(linkClickTotals.link_click_count)] as const,
        ),
    );

    return {
        snapshot: {
            workshop: mapWorkshopRow(workshopRow),
            contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map((contentBlock) =>
                mapWorkshopContentRow(contentBlock, linkClickCountByContentBlockId.get(contentBlock.id) ?? 0),
            ),
            comments,
            pinnedComment: pinnedCommentRow === null ? null : mapWorkshopCommentReferenceRow(pinnedCommentRow),
            participants: ((participantsResult.data ?? []) as WorkshopAdminParticipantRow[]).map((participant) =>
                mapWorkshopAdminParticipantRow(participant, activityTotalsByParticipantId.get(participant.id)),
            ),
            participantCount: participantCountResult.count ?? 0,
            commentCount: commentsCountResult.count ?? 0,
            reactionCount: reactionsResult.count ?? 0,
            artificialReactionCount: artificialReactionsResult.count ?? 0,
        },
        errorMessage: null,
    };
}
