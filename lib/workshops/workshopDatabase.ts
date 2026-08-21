import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { loadAllSupabaseRows, SUPABASE_ROW_PAGE_SIZE, type SupabaseRowsPage } from '@/lib/supabase/loadAllSupabaseRows';
import {
    MAXIMAL_RECENT_REACTION_COUNT,
    MAXIMAL_VISIBLE_COMMENT_COUNT,
    MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT,
    WORKSHOP_COMMENT_TABLE_NAME,
    WORKSHOP_CONTENT_LINK_CLICK_TABLE_NAME,
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
    WorkshopAdminAnalytics,
    WorkshopAdminParticipant,
    WorkshopAdminParticipantPage,
    WorkshopAdminParticipantTimeline,
    WorkshopAdminSnapshot,
    WorkshopAdminSummary,
    WorkshopAdminTimelinePoint,
    WorkshopComment,
    WorkshopCommentReference,
    WorkshopCommentSort,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopKind,
    WorkshopParticipant,
    WorkshopParticipantTimelineEvent,
    WorkshopPublicState,
    WorkshopReaction,
    WorkshopReactionCount,
    WorkshopSummary,
} from '@/lib/workshops/workshopTypes';
import type { WorkshopAdminParticipantQuery } from '@/lib/workshops/workshopAdminParticipantQuery';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type WorkshopRow = {
    readonly id: string;
    readonly room_kind: WorkshopKind;
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

type WorkshopSummaryRow = Pick<
    WorkshopRow,
    'id' | 'room_kind' | 'slug' | 'title' | 'starts_at' | 'ends_at' | 'is_published'
>;

/**
 * Fields the public list and the administration selector need to identify one occurrence without exposing its live
 * room configuration.
 */
export const WORKSHOP_SUMMARY_COLUMNS = 'id, room_kind, slug, title, starts_at, ends_at, is_published';

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

type WorkshopAdminParticipantPageRow = WorkshopAdminParticipantRow &
    WorkshopParticipantActivityTotalsRow & {
        readonly total_count: number | string;
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

type WorkshopParticipantCountRow = {
    readonly workshop_id: string;
    readonly participant_count: number | string;
};

type WorkshopCommentUpvoteRow = {
    readonly id: string;
    readonly comment_id: string;
    readonly created_at: string;
};

type WorkshopContentLinkClickRow = {
    readonly id: string;
    readonly content_block_id: string;
    readonly created_at: string;
};

type WorkshopParticipantTimelineCommentRow = Pick<WorkshopCommentRow, 'id' | 'body' | 'status' | 'created_at'>;

type WorkshopParticipantTimelineContentRow = Pick<WorkshopContentRow, 'id' | 'title'>;

type WorkshopParticipantTimelineCommentReferenceRow = Pick<WorkshopCommentRow, 'id' | 'author_name' | 'body'>;

type WorkshopAdminTimelinePointRow = {
    readonly bucket_starts_at: string;
    readonly participant_count: number | string;
    readonly comment_count: number | string;
    readonly reaction_count: number | string;
    readonly upvote_count: number | string;
    readonly link_click_count: number | string;
};

type WorkshopAdminReactionExportRow = {
    readonly id: string;
    readonly participant_id: string | null;
    readonly emoji: string;
    readonly created_at: string;
    readonly is_artificial: boolean;
};

type WorkshopAdminParticipantIdentityRow = Pick<WorkshopAdminParticipantRow, 'id' | 'fullname' | 'email'>;

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

/**
 * Splits a set of foreign keys into database-safe batches. It avoids PostgREST's response limit truncating an
 * otherwise complete participant timeline or a large reaction export.
 */
async function loadWorkshopRowsByIds<Row>(
    rowIds: readonly string[],
    loadRows: (pageRowIds: readonly string[]) => PromiseLike<SupabaseRowsPage<Row>>,
): Promise<{ readonly rows: readonly Row[] | null; readonly errorMessage: string | null }> {
    const distinctRowIds = Array.from(new Set(rowIds));
    if (distinctRowIds.length === 0) {
        return { rows: [], errorMessage: null };
    }

    const rows: Row[] = [];
    for (let fromIndex = 0; fromIndex < distinctRowIds.length; fromIndex += SUPABASE_ROW_PAGE_SIZE) {
        const pageRowIds = distinctRowIds.slice(fromIndex, fromIndex + SUPABASE_ROW_PAGE_SIZE);
        const { data, error } = await loadRows(pageRowIds);
        if (error) {
            return { rows: null, errorMessage: error.message };
        }

        rows.push(...(data ?? []));
    }

    return { rows, errorMessage: null };
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
        kind: row.room_kind,
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
        kind: row.room_kind,
        slug: row.slug,
        title: row.title,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        isPublished: row.is_published,
    };
}

function mapWorkshopAdminSummaryRow(row: WorkshopSummaryRow, participantCount: number): WorkshopAdminSummary {
    return { ...mapWorkshopSummaryRow(row), participantCount };
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

export function mapWorkshopAdminParticipantRow(
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

function mapWorkshopAdminParticipantPageRow(row: WorkshopAdminParticipantPageRow): WorkshopAdminParticipant {
    return mapWorkshopAdminParticipantRow(row, row);
}

function getWorkshopAdminTimelineBucketDurationSeconds(workshopRow: WorkshopRow): number {
    const startsAtMilliseconds = Date.parse(workshopRow.starts_at);
    const currentMilliseconds = Date.now();
    const configuredEndsAtMilliseconds =
        workshopRow.ends_at === null ? currentMilliseconds : Date.parse(workshopRow.ends_at);
    const endsAtMilliseconds = Math.max(startsAtMilliseconds, configuredEndsAtMilliseconds);
    const durationMilliseconds = endsAtMilliseconds - startsAtMilliseconds;

    if (durationMilliseconds <= 2 * 60 * 60 * 1_000) {
        return 300;
    }

    if (durationMilliseconds <= 8 * 60 * 60 * 1_000) {
        return 900;
    }

    if (durationMilliseconds <= 3 * 24 * 60 * 60 * 1_000) {
        return 3_600;
    }

    return 86_400;
}

function getWorkshopAdminTimelineEndsAt(workshopRow: WorkshopRow): string {
    const startsAtMilliseconds = Date.parse(workshopRow.starts_at);
    const endsAtMilliseconds = workshopRow.ends_at === null ? Date.now() : Date.parse(workshopRow.ends_at);

    return new Date(Math.max(startsAtMilliseconds, endsAtMilliseconds)).toISOString();
}

function mapWorkshopAdminTimelinePointRow(row: WorkshopAdminTimelinePointRow): WorkshopAdminTimelinePoint {
    return {
        startsAt: row.bucket_starts_at,
        participantCount: getNonNegativeWholeNumber(row.participant_count),
        commentCount: getNonNegativeWholeNumber(row.comment_count),
        reactionCount: getNonNegativeWholeNumber(row.reaction_count),
        upvoteCount: getNonNegativeWholeNumber(row.upvote_count),
        linkClickCount: getNonNegativeWholeNumber(row.link_click_count),
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
        .eq('room_kind', 'workshop')
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
        .eq('room_kind', 'workshop')
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

/**
 * Lists every published workshop occurrence for the persistent community room. Drafts stay private, while past
 * terms stay available as useful community history.
 */
export async function findPublishedWorkshops(supabase: SupabaseClient): Promise<readonly WorkshopSummaryRow[]> {
    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopSummaryRow>((fromIndex, toIndex) =>
        supabase
            .from(WORKSHOP_TABLE_NAME)
            .select(WORKSHOP_SUMMARY_COLUMNS)
            .eq('room_kind', 'workshop')
            .eq('is_published', true)
            .order('starts_at', { ascending: false })
            .order('id', { ascending: false })
            .range(fromIndex, toIndex),
    );

    if (rows === null) {
        console.error('Failed to load published workshops:', errorMessage ?? 'Unknown database error');
        return [];
    }

    return rows;
}

/**
 * Resolves the one community room. The database allows at most one such row, so `maybeSingle` turns an absent
 * configuration into an ordinary unavailable public page instead of picking an arbitrary room.
 */
export async function findPublishedCommunity(supabase: SupabaseClient): Promise<WorkshopRow | null> {
    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select('*')
        .eq('room_kind', 'community')
        .eq('is_published', true)
        .maybeSingle();

    if (error) {
        console.error('Failed to load the community room:', error.message);
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

/**
 * Counts the audience of every occurrence of one room kind at once
 *
 * Note: The database aggregates all the counts in a single statement, so listing a hundred terms never costs a
 *       hundred count queries.
 * Note: An unavailable count must never take the whole list of occurrences down with it, so a failure is reported as
 *       no counted audience at all.
 */
async function countWorkshopParticipantsByWorkshop(
    supabase: SupabaseClient,
    workshopKind: WorkshopKind,
): Promise<ReadonlyMap<string, number>> {
    const { data, error } = await supabase.rpc('get_workshop_participant_counts', { target_room_kind: workshopKind });
    if (error) {
        console.error('Failed to count the participants of the listed workshops:', error.message);
        return new Map();
    }

    return new Map(
        ((data ?? []) as WorkshopParticipantCountRow[]).map(
            (participantCounts) =>
                [
                    participantCounts.workshop_id,
                    getNonNegativeWholeNumber(participantCounts.participant_count),
                ] as const,
        ),
    );
}

/**
 * Lists every occurrence of one room kind for the administration, together with the audience each of them gathered.
 */
export async function loadWorkshopAdminSummaries(
    supabase: SupabaseClient,
    workshopKind: WorkshopKind,
): Promise<{ readonly workshops: readonly WorkshopAdminSummary[] | null; readonly errorMessage: string | null }> {
    const [workshopsResult, participantCountByWorkshopId] = await Promise.all([
        supabase
            .from(WORKSHOP_TABLE_NAME)
            .select(WORKSHOP_SUMMARY_COLUMNS)
            .eq('room_kind', workshopKind)
            .order('starts_at', { ascending: false }),
        countWorkshopParticipantsByWorkshop(supabase, workshopKind),
    ]);

    if (workshopsResult.error) {
        return { workshops: null, errorMessage: workshopsResult.error.message };
    }

    return {
        workshops: ((workshopsResult.data ?? []) as WorkshopSummaryRow[]).map((workshopRow) =>
            mapWorkshopAdminSummaryRow(workshopRow, participantCountByWorkshopId.get(workshopRow.id) ?? 0),
        ),
        errorMessage: null,
    };
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
 * Loads one page of participants together with the activity totals used for its sortable columns.
 *
 * Note: The database applies the filters and sort before it limits the result, so a large workshop never needs to send
 * every participant to the browser just to display one page.
 */
export async function loadWorkshopAdminParticipantPage(
    supabase: SupabaseClient,
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<{ readonly page: WorkshopAdminParticipantPage | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase.rpc('get_workshop_admin_participant_page', {
        target_workshop_id: workshopId,
        target_search_query: query.searchQuery,
        target_is_trusted: query.isTrusted,
        target_is_interaction_banned: query.isInteractionBanned,
        target_registered_from: query.registeredFrom,
        target_registered_to: query.registeredTo,
        target_sort_by: query.sortBy,
        target_sort_direction: query.sortDirection,
        target_limit: query.pageSize,
        target_offset: (query.page - 1) * query.pageSize,
    });
    if (error) {
        return { page: null, errorMessage: error.message };
    }

    const participantRows = (data ?? []) as WorkshopAdminParticipantPageRow[];
    return {
        page: {
            participants: participantRows.map(mapWorkshopAdminParticipantPageRow),
            totalCount: getNonNegativeWholeNumber(participantRows[0]?.total_count),
        },
        errorMessage: null,
    };
}

/**
 * Loads the exact actions of one participant from their existing source records.
 *
 * Note: Registration and last activity are participant fields rather than action rows, so they are added as two
 * explicit timeline events next to comments, reactions, votes, and material clicks.
 */
export async function loadWorkshopAdminParticipantTimeline(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participantId: string,
): Promise<{ readonly timeline: WorkshopAdminParticipantTimeline | null; readonly errorMessage: string | null }> {
    const [participantResult, commentsResult, reactionsResult, upvotesResult, linkClicksResult] = await Promise.all([
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select(
                'id, fullname, email, connected_at, last_seen_at, is_interaction_banned, is_trusted, active_duration_seconds',
            )
            .eq('workshop_id', workshopRow.id)
            .eq('id', participantId)
            .maybeSingle(),
        loadAllSupabaseRows<WorkshopParticipantTimelineCommentRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_COMMENT_TABLE_NAME)
                .select('id, body, status, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
        loadAllSupabaseRows<WorkshopReactionRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_REACTION_TABLE_NAME)
                .select('id, emoji, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
        loadAllSupabaseRows<WorkshopCommentUpvoteRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_UPVOTE_TABLE_NAME)
                .select('id, comment_id, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
        loadAllSupabaseRows<WorkshopContentLinkClickRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_CONTENT_LINK_CLICK_TABLE_NAME)
                .select('id, content_block_id, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
    ]);

    const firstErrorMessage =
        participantResult.error?.message ??
        commentsResult.errorMessage ??
        reactionsResult.errorMessage ??
        upvotesResult.errorMessage ??
        linkClicksResult.errorMessage ??
        null;
    if (firstErrorMessage !== null) {
        return { timeline: null, errorMessage: firstErrorMessage };
    }

    if (participantResult.data === null) {
        return { timeline: null, errorMessage: null };
    }

    const participant = participantResult.data as WorkshopAdminParticipantRow;
    const commentRows = commentsResult.rows ?? [];
    const reactionRows = reactionsResult.rows ?? [];
    const upvoteRows = upvotesResult.rows ?? [];
    const linkClickRows = linkClicksResult.rows ?? [];
    const upvotedCommentIds = Array.from(new Set(upvoteRows.map((upvote) => upvote.comment_id)));
    const clickedContentBlockIds = Array.from(new Set(linkClickRows.map((linkClick) => linkClick.content_block_id)));

    const [upvotedCommentsResult, clickedContentBlocksResult] = await Promise.all([
        loadWorkshopRowsByIds<WorkshopParticipantTimelineCommentReferenceRow>(upvotedCommentIds, (pageCommentIds) =>
            supabase
                .from(WORKSHOP_COMMENT_TABLE_NAME)
                .select('id, author_name, body')
                .eq('workshop_id', workshopRow.id)
                .in('id', pageCommentIds),
        ),
        loadWorkshopRowsByIds<WorkshopParticipantTimelineContentRow>(clickedContentBlockIds, (pageContentBlockIds) =>
            supabase
                .from(WORKSHOP_CONTENT_TABLE_NAME)
                .select('id, title')
                .eq('workshop_id', workshopRow.id)
                .in('id', pageContentBlockIds),
        ),
    ]);
    const contextErrorMessage = upvotedCommentsResult.errorMessage ?? clickedContentBlocksResult.errorMessage;
    if (contextErrorMessage !== null) {
        return { timeline: null, errorMessage: contextErrorMessage };
    }

    const upvotedCommentById = new Map<string, WorkshopParticipantTimelineCommentReferenceRow>(
        (upvotedCommentsResult.rows ?? []).map((comment) => [comment.id, comment] as const),
    );
    const clickedContentBlockById = new Map<string, WorkshopParticipantTimelineContentRow>(
        (clickedContentBlocksResult.rows ?? []).map((contentBlock) => [contentBlock.id, contentBlock] as const),
    );
    const events: WorkshopParticipantTimelineEvent[] = [
        { kind: 'joined' as const, id: `joined-${participant.id}`, occurredAt: participant.connected_at },
        { kind: 'last-seen' as const, id: `last-seen-${participant.id}`, occurredAt: participant.last_seen_at },
        ...commentRows.map((comment): WorkshopParticipantTimelineEvent => ({
            kind: 'comment',
            id: comment.id,
            occurredAt: comment.created_at,
            body: comment.body,
            status: comment.status,
        })),
        ...reactionRows.map((reaction): WorkshopParticipantTimelineEvent => ({
            kind: 'reaction',
            id: reaction.id,
            occurredAt: reaction.created_at,
            emoji: reaction.emoji,
        })),
        ...upvoteRows.map((upvote): WorkshopParticipantTimelineEvent => {
            const comment = upvotedCommentById.get(upvote.comment_id);
            return {
                kind: 'upvote',
                id: upvote.id,
                occurredAt: upvote.created_at,
                commentId: upvote.comment_id,
                commentAuthorName: comment?.author_name ?? null,
                commentBody: comment?.body ?? null,
            };
        }),
        ...linkClickRows.map((linkClick): WorkshopParticipantTimelineEvent => ({
            kind: 'content-link-click',
            id: linkClick.id,
            occurredAt: linkClick.created_at,
            contentBlockId: linkClick.content_block_id,
            contentBlockTitle: clickedContentBlockById.get(linkClick.content_block_id)?.title ?? null,
        })),
    ].sort(
        (firstEvent, secondEvent) =>
            firstEvent.occurredAt.localeCompare(secondEvent.occurredAt) || firstEvent.id.localeCompare(secondEvent.id),
    );

    return {
        timeline: {
            participant: mapWorkshopAdminParticipantRow(participant, {
                participant_id: participant.id,
                comment_count: commentRows.length,
                reaction_count: reactionRows.length,
                link_click_count: linkClickRows.length,
                upvote_count: upvoteRows.length,
            }),
            events,
        },
        errorMessage: null,
    };
}

/**
 * Loads compact workshop-wide timeline buckets and reaction totals for the overview and reactions sections.
 */
export async function loadWorkshopAdminAnalytics(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<{ readonly analytics: WorkshopAdminAnalytics | null; readonly errorMessage: string | null }> {
    const bucketDurationSeconds = getWorkshopAdminTimelineBucketDurationSeconds(workshopRow);
    const [timelineResult, reactionCountsResult] = await Promise.all([
        supabase.rpc('get_workshop_admin_timeline', {
            target_workshop_id: workshopRow.id,
            target_bucket_seconds: bucketDurationSeconds,
        }),
        supabase.rpc('get_workshop_reaction_counts', { target_workshop_id: workshopRow.id }),
    ]);
    const firstError = timelineResult.error ?? reactionCountsResult.error;
    if (firstError) {
        return { analytics: null, errorMessage: firstError.message };
    }

    return {
        analytics: {
            timelineStartsAt: workshopRow.starts_at,
            timelineEndsAt: getWorkshopAdminTimelineEndsAt(workshopRow),
            bucketDurationSeconds,
            timeline: ((timelineResult.data ?? []) as WorkshopAdminTimelinePointRow[]).map(
                mapWorkshopAdminTimelinePointRow,
            ),
            reactionCounts: ((reactionCountsResult.data ?? []) as WorkshopReactionCountRow[]).map(
                mapWorkshopReactionCountRow,
            ),
        },
        errorMessage: null,
    };
}

/**
 * Loads every participant which matches the administration filter for a file export.
 *
 * Note: The export keeps the exact same filter and sort as the participant table, while intentionally ignoring its
 * current page so a spreadsheet always contains the complete selected audience.
 */
export async function loadWorkshopAdminParticipantsForExport(
    supabase: SupabaseClient,
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<{
    readonly participants: readonly WorkshopAdminParticipant[] | null;
    readonly errorMessage: string | null;
}> {
    const exportQuery: WorkshopAdminParticipantQuery = {
        ...query,
        page: 1,
        pageSize: SUPABASE_ROW_PAGE_SIZE,
    };
    const firstPageResult = await loadWorkshopAdminParticipantPage(supabase, workshopId, exportQuery);
    if (firstPageResult.page === null) {
        return { participants: null, errorMessage: firstPageResult.errorMessage };
    }

    const participants = [...firstPageResult.page.participants];
    const totalPageCount = Math.ceil(firstPageResult.page.totalCount / exportQuery.pageSize);
    for (let currentPage = 2; currentPage <= totalPageCount; currentPage += 1) {
        const pageResult = await loadWorkshopAdminParticipantPage(supabase, workshopId, {
            ...exportQuery,
            page: currentPage,
        });
        if (pageResult.page === null) {
            return { participants: null, errorMessage: pageResult.errorMessage };
        }

        participants.push(...pageResult.page.participants);
    }

    return { participants, errorMessage: null };
}

/**
 * Loads all comments for a CSV export, without inheriting the short moderation list used by the interactive screen.
 */
export async function loadWorkshopAdminCommentsForExport(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<{ readonly comments: readonly WorkshopAdminComment[] | null; readonly errorMessage: string | null }> {
    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopCommentRow>((fromIndex, toIndex) =>
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select(WORKSHOP_COMMENT_COLUMNS)
            .eq('workshop_id', workshopRow.id)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(fromIndex, toIndex),
    );
    if (rows === null) {
        return { comments: null, errorMessage };
    }

    return {
        comments: rows.map((row): WorkshopAdminComment => ({
            ...mapWorkshopCommentRow(row, false, workshopRow.pinned_comment_id),
            participantId: row.participant_id,
            isArtificial: row.is_artificial,
            realUpvoteCount: row.upvote_count,
            artificialUpvoteCount: row.artificial_upvote_count,
            parentComment: null,
        })),
        errorMessage: null,
    };
}

/**
 * Reads enough participant identity to make exported reactions understandable, including artificial reactions whose
 * participant is intentionally absent.
 */
async function loadWorkshopParticipantIdentities(
    supabase: SupabaseClient,
    workshopId: string,
    participantIds: readonly string[],
): Promise<{
    readonly identityByParticipantId: ReadonlyMap<string, WorkshopAdminParticipantIdentityRow> | null;
    readonly errorMessage: string | null;
}> {
    const { rows, errorMessage } = await loadWorkshopRowsByIds<WorkshopAdminParticipantIdentityRow>(
        participantIds,
        (pageParticipantIds) =>
            supabase
                .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
                .select('id, fullname, email')
                .eq('workshop_id', workshopId)
                .in('id', pageParticipantIds),
    );
    if (rows === null) {
        return { identityByParticipantId: null, errorMessage };
    }

    return {
        identityByParticipantId: new Map(rows.map((participant) => [participant.id, participant] as const)),
        errorMessage: null,
    };
}

/**
 * Loads every reaction with the optional human identity which sent it, for the reactions CSV export.
 */
export async function loadWorkshopAdminReactionsForExport(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<
    | {
          readonly reactions: readonly {
              readonly id: string;
              readonly occurredAt: string;
              readonly emoji: string;
              readonly participantFullname: string | null;
              readonly participantEmail: string | null;
              readonly isArtificial: boolean;
          }[];
          readonly errorMessage: null;
      }
    | { readonly reactions: null; readonly errorMessage: string | null }
> {
    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopAdminReactionExportRow>((fromIndex, toIndex) =>
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id, participant_id, emoji, created_at, is_artificial')
            .eq('workshop_id', workshopId)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(fromIndex, toIndex),
    );
    if (rows === null) {
        return { reactions: null, errorMessage };
    }

    const participantIds = rows
        .map((reaction) => reaction.participant_id)
        .filter((participantId): participantId is string => participantId !== null);
    const { identityByParticipantId, errorMessage: identityErrorMessage } = await loadWorkshopParticipantIdentities(
        supabase,
        workshopId,
        participantIds,
    );
    if (identityByParticipantId === null) {
        return { reactions: null, errorMessage: identityErrorMessage };
    }

    return {
        reactions: rows.map((reaction) => {
            const participant =
                reaction.participant_id === null ? undefined : identityByParticipantId.get(reaction.participant_id);
            return {
                id: reaction.id,
                occurredAt: reaction.created_at,
                emoji: reaction.emoji,
                participantFullname: participant?.fullname ?? null,
                participantEmail: participant?.email ?? null,
                isArtificial: reaction.is_artificial,
            };
        }),
        errorMessage: null,
    };
}

/**
 * Loads all content blocks with their measured material-link clicks for the content CSV export.
 */
export async function loadWorkshopAdminContentForExport(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<{ readonly contentBlocks: readonly WorkshopContentBlock[] | null; readonly errorMessage: string | null }> {
    const [contentResult, contentLinkClickTotalsResult] = await Promise.all([
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select('id, title, body_markdown, unlock_at, sort_order, is_published, created_at, updated_at')
            .eq('workshop_id', workshopId)
            .order('sort_order', { ascending: true })
            .order('unlock_at', { ascending: true }),
        supabase.rpc('get_workshop_content_link_click_totals', { target_workshop_id: workshopId }),
    ]);
    const firstError = contentResult.error ?? contentLinkClickTotalsResult.error;
    if (firstError) {
        return { contentBlocks: null, errorMessage: firstError.message };
    }

    const linkClickCountByContentBlockId = new Map<string, number>(
        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
            (linkClickTotals) =>
                [
                    linkClickTotals.content_block_id,
                    getNonNegativeWholeNumber(linkClickTotals.link_click_count),
                ] as const,
        ),
    );
    return {
        contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map((contentBlock) =>
            mapWorkshopContentRow(contentBlock, linkClickCountByContentBlockId.get(contentBlock.id) ?? 0),
        ),
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

type WorkshopAdminSnapshotOptions = {
    /**
     * Whether the currently opened administration section needs the list of moderated comments.
     */
    readonly isCommentsIncluded: boolean;
};

export async function loadWorkshopAdminSnapshot(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    commentStatus: WorkshopCommentStatus,
    options: WorkshopAdminSnapshotOptions = { isCommentsIncluded: true },
): Promise<{ readonly snapshot: WorkshopAdminSnapshot | null; readonly errorMessage: string | null }> {
    const [
        contentResult,
        commentsResult,
        commentsCountResult,
        participantCountResult,
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
        options.isCommentsIncluded
            ? supabase
                  .from(WORKSHOP_COMMENT_TABLE_NAME)
                  .select(WORKSHOP_COMMENT_COLUMNS)
                  .eq('workshop_id', workshopRow.id)
                  .eq('status', commentStatus)
                  .order('created_at', { ascending: false })
                  .limit(MAXIMAL_ADMIN_COMMENT_LIST_COUNT)
            : Promise.resolve({ data: [], error: null }),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
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
        options.isCommentsIncluded ? loadPinnedWorkshopCommentRowOrNull(supabase, workshopRow) : Promise.resolve(null),
    ]);

    const firstError =
        contentResult.error ??
        commentsResult.error ??
        commentsCountResult.error ??
        participantCountResult.error ??
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
        parentComment: row.parent_comment_id === null ? null : (answeredCommentById.get(row.parent_comment_id) ?? null),
    }));
    const linkClickCountByContentBlockId = new Map<string, number>(
        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
            (linkClickTotals) =>
                [
                    linkClickTotals.content_block_id,
                    getNonNegativeWholeNumber(linkClickTotals.link_click_count),
                ] as const,
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
            participants: [],
            participantCount: participantCountResult.count ?? 0,
            commentCount: commentsCountResult.count ?? 0,
            reactionCount: reactionsResult.count ?? 0,
            artificialReactionCount: artificialReactionsResult.count ?? 0,
        },
        errorMessage: null,
    };
}
