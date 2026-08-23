-- The participant page of the workshop administration, told once and for all which `fullname` it means.
--
-- `RETURNS TABLE` declares every returned column as a PL/pgSQL variable of the
-- function, so a `fullname` inside the query could mean either that variable or
-- the column of the same name, which PostgreSQL refuses with
-- `column reference "fullname" is ambiguous` while it prepares the query. That
-- took down the participants of `/admin/workshops` and of `/admin/community`
-- whatever the chosen sort was, together with their CSV and vCard exports,
-- because the whole ordering is parsed before a single row is read.
--
-- Qualifying every ordering key already fixed the text of the function, but a
-- database still holding an older body of it keeps refusing the very same
-- query, and only an applied migration can mend that. So this one is written to
-- be the last word on the conflict whatever the database currently holds:
--
--   * `#variable_conflict use_column` decides the conflict for the whole
--     function at once, rather than leaving every future line of it to
--     remember to name its row source. Nothing else can resolve to a column by
--     accident, because every parameter of the function is prefixed `target_`
--     and no column of `workshop_participants` is.
--   * Both signatures which this function ever had are dropped first, so an
--     older one cannot survive next to it as a second overload for a request
--     to choose from.

BEGIN;

DROP FUNCTION IF EXISTS public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
);
DROP FUNCTION IF EXISTS public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
);

CREATE FUNCTION public.get_workshop_admin_participant_page(
    target_workshop_id uuid,
    target_search_query text DEFAULT '',
    target_is_trusted boolean DEFAULT NULL,
    target_is_moderator boolean DEFAULT NULL,
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
    is_moderator boolean,
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
#variable_conflict use_column
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
            workshop_participant.is_moderator,
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
          AND (target_is_moderator IS NULL OR workshop_participant.is_moderator = target_is_moderator)
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
        CASE
            WHEN target_sort_by = 'fullname' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.fullname
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'fullname' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.fullname
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'email' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.email
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'email' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.email
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'connectedAt' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.connected_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'connectedAt' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.connected_at
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'lastSeenAt' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.last_seen_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'lastSeenAt' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.last_seen_at
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'activeDurationSeconds' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.active_duration_seconds
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'activeDurationSeconds' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.active_duration_seconds
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'commentCount' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.comment_count
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'commentCount' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.comment_count
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'reactionCount' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.reaction_count
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'reactionCount' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.reaction_count
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'linkClickCount' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.link_click_count
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'linkClickCount' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.link_click_count
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'upvoteCount' AND target_sort_direction = 'ASCENDING'
                THEN participant_page.upvote_count
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'upvoteCount' AND target_sort_direction = 'DESCENDING'
                THEN participant_page.upvote_count
        END DESC NULLS LAST,
        participant_page.id ASC
    LIMIT target_limit
    OFFSET target_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
) TO service_role;

COMMIT;
