-- Material links are public short links, not browser-reported workshop events.
--
-- A short link can be copied and opened later by somebody who never joined the
-- room, so it has no trustworthy workshop participant to attach to. The mapping
-- below therefore keeps the truthful aggregate: a material knows its short
-- links, and its clicks come from the existing ShortcodeLinkClick table.

BEGIN;

-- The retired App relation says nothing about the product surface which made a
-- link. These two fields are deliberately small, independent provenance for
-- the admin shortener: a manual link and an automatically created material link
-- can now be filtered without making an old App record part of the workflow.
ALTER TABLE public."ShortcodeLink"
    ADD COLUMN IF NOT EXISTS "isAdHoc" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "sourceApp" text NOT NULL DEFAULT 'admin-shortener';

ALTER TABLE public."ShortcodeLink"
    DROP CONSTRAINT IF EXISTS "ShortcodeLink_sourceApp_valid";
ALTER TABLE public."ShortcodeLink"
    ADD CONSTRAINT "ShortcodeLink_sourceApp_valid"
        CHECK ("sourceApp" IN ('admin-shortener', 'online-workshop', 'community'));

CREATE INDEX IF NOT EXISTS "ShortcodeLink_provenance_idx"
    ON public."ShortcodeLink" ("isAdHoc", "sourceApp", "createdAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "ShortcodeLinkClick_shortcodeLinkId_navigatedAt_idx"
    ON public."ShortcodeLinkClick" ("shortcodeLinkId", "navigatedAt")
    WHERE "navigatedAt" IS NOT NULL;

-- One content block may contain many destinations, but one automatically made
-- shortcode belongs to exactly one material. The raw destination remains in
-- this mapping instead of replacing it in Markdown, so an editor can still see
-- and change the real address and a removed shortcode can be recreated safely.
CREATE TABLE IF NOT EXISTS public.workshop_content_shortcode_links (
    content_block_id uuid NOT NULL
        REFERENCES public.workshop_content_blocks(id) ON DELETE CASCADE,
    destination_url text NOT NULL CHECK (btrim(destination_url) <> ''),
    shortcode_link_id bigint NOT NULL
        REFERENCES public."ShortcodeLink"(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (content_block_id, destination_url),
    UNIQUE (shortcode_link_id)
);

ALTER TABLE public.workshop_content_shortcode_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_content_shortcode_links FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_content_shortcode_links FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_content_shortcode_links TO service_role;

-- The content overview and its CSV now count a server-side shortener navigation
-- as soon as the public material address is opened. This deliberately does not
-- depend on the optional JavaScript which a landing page uses after its visitor
-- chooses a destination.
CREATE OR REPLACE FUNCTION public.get_workshop_content_link_click_totals(target_workshop_id uuid)
RETURNS TABLE (
    content_block_id uuid,
    link_click_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        workshop_content_block.id,
        count(shortcode_link_click.id)::bigint
    FROM public.workshop_content_blocks AS workshop_content_block
    LEFT JOIN public.workshop_content_shortcode_links AS material_shortcode_link
        ON material_shortcode_link.content_block_id = workshop_content_block.id
    LEFT JOIN public."ShortcodeLinkClick" AS shortcode_link_click
        ON shortcode_link_click."shortcodeLinkId" = material_shortcode_link.shortcode_link_id
       AND shortcode_link_click."navigatedAt" IS NOT NULL
    WHERE workshop_content_block.workshop_id = target_workshop_id
    GROUP BY workshop_content_block.id;
$$;

-- Shortener clicks cannot say which signed-in workshop participant eventually
-- opened the public URL. Drop that false attribution from the participant list,
-- its detail timeline, and the private Contact projection while retaining
-- comments, reactions, and votes that still have a real participant source.
DROP FUNCTION IF EXISTS public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
);
DROP FUNCTION IF EXISTS public.get_workshop_participant_activity_totals(uuid);
DROP FUNCTION IF EXISTS public.get_workshop_participant_activity_totals_for_workshops(uuid[]);

CREATE FUNCTION public.get_workshop_participant_activity_totals_for_workshops(target_workshop_ids uuid[])
RETURNS TABLE (
    workshop_id uuid,
    participant_id uuid,
    comment_count bigint,
    reaction_count bigint,
    upvote_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    WITH comment_totals AS (
        SELECT
            workshop_comment.workshop_id,
            workshop_comment.participant_id,
            count(*)::bigint AS comment_count
        FROM public.workshop_comments AS workshop_comment
        WHERE workshop_comment.participant_id IS NOT NULL
          AND workshop_comment.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_comment.workshop_id, workshop_comment.participant_id
    ), reaction_totals AS (
        SELECT
            workshop_reaction.workshop_id,
            workshop_reaction.participant_id,
            count(*)::bigint AS reaction_count
        FROM public.workshop_reactions AS workshop_reaction
        WHERE workshop_reaction.participant_id IS NOT NULL
          AND workshop_reaction.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_reaction.workshop_id, workshop_reaction.participant_id
    ), upvote_totals AS (
        SELECT
            workshop_upvote.workshop_id,
            workshop_upvote.participant_id,
            count(*)::bigint AS upvote_count
        FROM public.workshop_comment_upvotes AS workshop_upvote
        WHERE workshop_upvote.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_upvote.workshop_id, workshop_upvote.participant_id
    )
    SELECT
        workshop_participant.workshop_id,
        workshop_participant.id,
        COALESCE(comment_totals.comment_count, 0)::bigint,
        COALESCE(reaction_totals.reaction_count, 0)::bigint,
        COALESCE(upvote_totals.upvote_count, 0)::bigint
    FROM public.workshop_participants AS workshop_participant
    LEFT JOIN comment_totals
        ON comment_totals.workshop_id = workshop_participant.workshop_id
       AND comment_totals.participant_id = workshop_participant.id
    LEFT JOIN reaction_totals
        ON reaction_totals.workshop_id = workshop_participant.workshop_id
       AND reaction_totals.participant_id = workshop_participant.id
    LEFT JOIN upvote_totals
        ON upvote_totals.workshop_id = workshop_participant.workshop_id
       AND upvote_totals.participant_id = workshop_participant.id
    WHERE workshop_participant.workshop_id = ANY(target_workshop_ids);
$$;

CREATE FUNCTION public.get_workshop_participant_activity_totals(target_workshop_id uuid)
RETURNS TABLE (
    participant_id uuid,
    comment_count bigint,
    reaction_count bigint,
    upvote_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        activity_totals.participant_id,
        activity_totals.comment_count,
        activity_totals.reaction_count,
        activity_totals.upvote_count
    FROM public.get_workshop_participant_activity_totals_for_workshops(ARRAY[target_workshop_id]) AS activity_totals;
$$;

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

-- The workshop overview preserves its existing axes but now draws material
-- clicks from the shortener's redirect timestamp rather than a browser POST.
-- A database can still hold the predecessor with a different returned row
-- shape, for which PostgreSQL refuses CREATE OR REPLACE. Recreate the one
-- privileged function as the overview-graph migration already did.
DROP FUNCTION IF EXISTS public.get_workshop_admin_timeline(uuid, integer);

CREATE FUNCTION public.get_workshop_admin_timeline(
    target_workshop_id uuid,
    target_bucket_seconds integer
)
RETURNS TABLE (
    bucket_starts_at timestamptz,
    watching_participant_count bigint,
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
    IF target_bucket_seconds NOT IN (60, 300, 900, 3600, 86400) THEN
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

        SELECT shortcode_link_click."navigatedAt" AT TIME ZONE 'UTC', 'link_click'::text
        FROM public."ShortcodeLinkClick" AS shortcode_link_click
        INNER JOIN public.workshop_content_shortcode_links AS material_shortcode_link
            ON material_shortcode_link.shortcode_link_id = shortcode_link_click."shortcodeLinkId"
        INNER JOIN public.workshop_content_blocks AS workshop_content_block
            ON workshop_content_block.id = material_shortcode_link.content_block_id
        WHERE workshop_content_block.workshop_id = target_workshop_id
          AND shortcode_link_click."navigatedAt" IS NOT NULL
    ), bucketed_events AS (
        SELECT
            date_bin(
                make_interval(secs => target_bucket_seconds),
                occurred_at,
                TIMESTAMPTZ '2000-01-01 00:00:00+00'
            ) AS bucket_starts_at,
            event_kind
        FROM workshop_events
    ), event_totals AS (
        SELECT
            bucketed_events.bucket_starts_at,
            count(*) FILTER (WHERE bucketed_events.event_kind = 'participant')::bigint AS participant_count,
            count(*) FILTER (WHERE bucketed_events.event_kind = 'comment')::bigint AS comment_count,
            count(*) FILTER (WHERE bucketed_events.event_kind = 'reaction')::bigint AS reaction_count,
            count(*) FILTER (WHERE bucketed_events.event_kind = 'upvote')::bigint AS upvote_count,
            count(*) FILTER (WHERE bucketed_events.event_kind = 'link_click')::bigint AS link_click_count
        FROM bucketed_events
        GROUP BY bucketed_events.bucket_starts_at
    ), watching_totals AS (
        SELECT
            date_bin(
                make_interval(secs => target_bucket_seconds),
                presence_sample.bucket_starts_at,
                TIMESTAMPTZ '2000-01-01 00:00:00+00'
            ) AS bucket_starts_at,
            count(DISTINCT presence_sample.participant_id)::bigint AS watching_participant_count
        FROM public.workshop_participant_presence_samples AS presence_sample
        WHERE presence_sample.workshop_id = target_workshop_id
        GROUP BY 1
    )
    SELECT
        COALESCE(event_totals.bucket_starts_at, watching_totals.bucket_starts_at),
        COALESCE(watching_totals.watching_participant_count, 0),
        COALESCE(event_totals.participant_count, 0),
        COALESCE(event_totals.comment_count, 0),
        COALESCE(event_totals.reaction_count, 0),
        COALESCE(event_totals.upvote_count, 0),
        COALESCE(event_totals.link_click_count, 0)
    FROM event_totals
    FULL OUTER JOIN watching_totals ON watching_totals.bucket_starts_at = event_totals.bucket_starts_at
    ORDER BY 1 ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_content_link_click_totals(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_participant_activity_totals_for_workshops(uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_participant_activity_totals(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_content_link_click_totals(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_activity_totals_for_workshops(uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_activity_totals(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_participant_page(
    uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer
) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) TO service_role;

COMMIT;
