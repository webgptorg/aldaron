-- Fast, private data sources for the detailed workshop administration.
--
-- The room already stores every participant action in its own audited table.
-- These service-role-only functions shape those records into the page of
-- participants and compact timeline buckets that the administration needs,
-- without copying identity or activity data into another event store.

BEGIN;

CREATE INDEX IF NOT EXISTS workshop_comments_timeline_idx
    ON public.workshop_comments (workshop_id, created_at ASC);
CREATE INDEX IF NOT EXISTS workshop_comment_upvotes_timeline_idx
    ON public.workshop_comment_upvotes (workshop_id, created_at ASC);
CREATE INDEX IF NOT EXISTS workshop_content_link_clicks_timeline_idx
    ON public.workshop_content_link_clicks (workshop_id, created_at ASC);
CREATE INDEX IF NOT EXISTS workshop_participants_admin_filter_idx
    ON public.workshop_participants (workshop_id, is_trusted, is_interaction_banned, connected_at DESC);
CREATE INDEX IF NOT EXISTS workshop_comments_participant_timeline_idx
    ON public.workshop_comments (workshop_id, participant_id, created_at ASC)
    WHERE participant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workshop_reactions_participant_timeline_idx
    ON public.workshop_reactions (workshop_id, participant_id, created_at ASC)
    WHERE participant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workshop_comment_upvotes_participant_timeline_idx
    ON public.workshop_comment_upvotes (workshop_id, participant_id, created_at ASC);

-- The participant filter intentionally supports a substring match. Trigram indexes keep that useful when a workshop
-- has a large audience instead of making an operator wait for a sequential scan of every name and e-mail address.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS workshop_participants_fullname_trigram_idx
    ON public.workshop_participants USING gin (fullname gin_trgm_ops);
CREATE INDEX IF NOT EXISTS workshop_participants_email_trigram_idx
    ON public.workshop_participants USING gin (email gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.get_workshop_admin_participant_page(
    target_workshop_id uuid,
    target_search_query text DEFAULT '',
    target_is_trusted boolean DEFAULT NULL,
    target_is_interaction_banned boolean DEFAULT NULL,
    target_registered_from timestamptz DEFAULT NULL,
    target_registered_to timestamptz DEFAULT NULL,
    target_sort_by text DEFAULT 'connectedAt',
    target_sort_direction text DEFAULT 'DESCENDING',
    target_limit integer DEFAULT 50,
    target_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    fullname text,
    email text,
    connected_at timestamptz,
    last_seen_at timestamptz,
    is_interaction_banned boolean,
    is_trusted boolean,
    active_duration_seconds integer,
    comment_count bigint,
    reaction_count bigint,
    link_click_count bigint,
    upvote_count bigint,
    total_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF target_sort_by NOT IN (
        'fullname',
        'email',
        'connectedAt',
        'lastSeenAt',
        'activeDurationSeconds',
        'commentCount',
        'reactionCount',
        'linkClickCount',
        'upvoteCount'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_PARTICIPANT_SORT_INVALID';
    END IF;

    IF target_sort_direction NOT IN ('ASCENDING', 'DESCENDING') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_PARTICIPANT_SORT_DIRECTION_INVALID';
    END IF;

    IF target_limit NOT BETWEEN 1 AND 5000 OR target_offset < 0 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_PARTICIPANT_PAGE_INVALID';
    END IF;

    RETURN QUERY
    WITH participant_activity AS (
        SELECT
            workshop_participant.id,
            workshop_participant.fullname,
            workshop_participant.email,
            workshop_participant.connected_at,
            workshop_participant.last_seen_at,
            workshop_participant.is_interaction_banned,
            workshop_participant.is_trusted,
            workshop_participant.active_duration_seconds,
            COALESCE(activity_totals.comment_count, 0)::bigint AS comment_count,
            COALESCE(activity_totals.reaction_count, 0)::bigint AS reaction_count,
            COALESCE(activity_totals.link_click_count, 0)::bigint AS link_click_count,
            COALESCE(activity_totals.upvote_count, 0)::bigint AS upvote_count
        FROM public.workshop_participants AS workshop_participant
        LEFT JOIN public.get_workshop_participant_activity_totals(target_workshop_id) AS activity_totals
            ON activity_totals.participant_id = workshop_participant.id
        WHERE workshop_participant.workshop_id = target_workshop_id
          AND (
              btrim(target_search_query) = ''
              OR workshop_participant.fullname ILIKE '%' || btrim(target_search_query) || '%'
              OR workshop_participant.email ILIKE '%' || btrim(target_search_query) || '%'
          )
          AND (target_is_trusted IS NULL OR workshop_participant.is_trusted = target_is_trusted)
          AND (
              target_is_interaction_banned IS NULL
              OR workshop_participant.is_interaction_banned = target_is_interaction_banned
          )
          AND (target_registered_from IS NULL OR workshop_participant.connected_at >= target_registered_from)
          AND (target_registered_to IS NULL OR workshop_participant.connected_at <= target_registered_to)
    ), participant_page AS (
        SELECT participant_activity.*, count(*) OVER ()::bigint AS total_count
        FROM participant_activity
    )
    SELECT *
    FROM participant_page
    ORDER BY
        CASE WHEN target_sort_by = 'fullname' AND target_sort_direction = 'ASCENDING' THEN fullname END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'fullname' AND target_sort_direction = 'DESCENDING' THEN fullname END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'email' AND target_sort_direction = 'ASCENDING' THEN email END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'email' AND target_sort_direction = 'DESCENDING' THEN email END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'connectedAt' AND target_sort_direction = 'ASCENDING' THEN connected_at END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'connectedAt' AND target_sort_direction = 'DESCENDING' THEN connected_at END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'lastSeenAt' AND target_sort_direction = 'ASCENDING' THEN last_seen_at END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'lastSeenAt' AND target_sort_direction = 'DESCENDING' THEN last_seen_at END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'activeDurationSeconds' AND target_sort_direction = 'ASCENDING'
                THEN active_duration_seconds
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'activeDurationSeconds' AND target_sort_direction = 'DESCENDING'
                THEN active_duration_seconds
        END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'commentCount' AND target_sort_direction = 'ASCENDING' THEN comment_count END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'commentCount' AND target_sort_direction = 'DESCENDING' THEN comment_count END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'reactionCount' AND target_sort_direction = 'ASCENDING' THEN reaction_count END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'reactionCount' AND target_sort_direction = 'DESCENDING' THEN reaction_count END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'linkClickCount' AND target_sort_direction = 'ASCENDING' THEN link_click_count END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'linkClickCount' AND target_sort_direction = 'DESCENDING' THEN link_click_count END DESC NULLS LAST,
        CASE WHEN target_sort_by = 'upvoteCount' AND target_sort_direction = 'ASCENDING' THEN upvote_count END ASC NULLS LAST,
        CASE WHEN target_sort_by = 'upvoteCount' AND target_sort_direction = 'DESCENDING' THEN upvote_count END DESC NULLS LAST,
        id ASC
    LIMIT target_limit
    OFFSET target_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_workshop_admin_timeline(
    target_workshop_id uuid,
    target_bucket_seconds integer
)
RETURNS TABLE (
    bucket_starts_at timestamptz,
    participant_count bigint,
    comment_count bigint,
    reaction_count bigint,
    upvote_count bigint,
    link_click_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF target_bucket_seconds NOT IN (300, 900, 3600, 86400) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_TIMELINE_BUCKET_INVALID';
    END IF;

    RETURN QUERY
    WITH workshop_events AS (
        SELECT workshop_participant.connected_at AS occurred_at, 'participant'::text AS event_kind
        FROM public.workshop_participants AS workshop_participant
        WHERE workshop_participant.workshop_id = target_workshop_id

        UNION ALL

        SELECT workshop_comment.created_at, 'comment'::text
        FROM public.workshop_comments AS workshop_comment
        WHERE workshop_comment.workshop_id = target_workshop_id

        UNION ALL

        SELECT workshop_reaction.created_at, 'reaction'::text
        FROM public.workshop_reactions AS workshop_reaction
        WHERE workshop_reaction.workshop_id = target_workshop_id

        UNION ALL

        SELECT workshop_upvote.created_at, 'upvote'::text
        FROM public.workshop_comment_upvotes AS workshop_upvote
        WHERE workshop_upvote.workshop_id = target_workshop_id

        UNION ALL

        SELECT workshop_link_click.created_at, 'link_click'::text
        FROM public.workshop_content_link_clicks AS workshop_link_click
        WHERE workshop_link_click.workshop_id = target_workshop_id
    ), bucketed_events AS (
        SELECT
            date_bin(
                make_interval(secs => target_bucket_seconds),
                occurred_at,
                TIMESTAMPTZ '2000-01-01 00:00:00+00'
            ) AS bucket_starts_at,
            event_kind
        FROM workshop_events
    )
    SELECT
        bucketed_events.bucket_starts_at,
        count(*) FILTER (WHERE bucketed_events.event_kind = 'participant')::bigint,
        count(*) FILTER (WHERE bucketed_events.event_kind = 'comment')::bigint,
        count(*) FILTER (WHERE bucketed_events.event_kind = 'reaction')::bigint,
        count(*) FILTER (WHERE bucketed_events.event_kind = 'upvote')::bigint,
        count(*) FILTER (WHERE bucketed_events.event_kind = 'link_click')::bigint
    FROM bucketed_events
    GROUP BY bucketed_events.bucket_starts_at
    ORDER BY bucketed_events.bucket_starts_at ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_admin_timeline(uuid, integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) TO service_role;

COMMIT;
