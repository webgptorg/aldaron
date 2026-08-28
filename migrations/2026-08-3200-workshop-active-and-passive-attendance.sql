-- Active and passive attendance of a room.
--
-- The room already sends a presence heartbeat while it is open, which says for how
-- long somebody had it open but never whether anybody was really sitting in front
-- of it. The heartbeat now also carries what the browser observed about the person
-- sending it: whether they moved a mouse, typed, scrolled or touched the screen
-- recently. Every measured minute is therefore either actively or passively
-- attended, which is what the audience of the administration graph is now split
-- by. Nothing is copied into a second store: the very same presence sample which
-- already counted the audience now also remembers how it was attended.

BEGIN;

-- A minute counts as actively attended as soon as one heartbeat covering it saw an
-- interaction, so a person who moves their mouse once in a minute is not made
-- passive by the quiet half of that same minute.
ALTER TABLE public.workshop_participant_presence_samples
    ADD COLUMN IF NOT EXISTS is_actively_attending boolean NOT NULL DEFAULT false;

-- The heartbeat gains what the room observed about the person sending it. The
-- previous signature is dropped rather than left beside the new one, so that one
-- function records presence and every caller sends the whole heartbeat.
DROP FUNCTION IF EXISTS public.record_workshop_participant_presence(uuid, uuid, integer);

CREATE FUNCTION public.record_workshop_participant_presence(
    target_workshop_id uuid,
    target_participant_id uuid,
    reported_active_duration_seconds integer,
    reported_is_actively_attending boolean DEFAULT false
)
RETURNS TABLE (active_duration_seconds integer)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    presence_recorded_at timestamptz := clock_timestamp();
BEGIN
    IF reported_active_duration_seconds NOT BETWEEN 1 AND 120 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_PRESENCE_DURATION_INVALID';
    END IF;

    RETURN QUERY
    UPDATE public.workshop_participants AS workshop_participant
    SET
        active_duration_seconds = workshop_participant.active_duration_seconds + LEAST(
            reported_active_duration_seconds,
            GREATEST(
                0,
                floor(
                    extract(
                        epoch
                        FROM presence_recorded_at - COALESCE(
                            workshop_participant.last_presence_at,
                            workshop_participant.connected_at
                        )
                    )
                )::integer
            )
        ),
        last_presence_at = presence_recorded_at,
        last_seen_at = presence_recorded_at
    WHERE workshop_participant.id = target_participant_id
      AND workshop_participant.workshop_id = target_workshop_id
    RETURNING workshop_participant.active_duration_seconds;

    -- A heartbeat of somebody who is not a participant of this room updates
    -- nothing, and must not leave a presence sample behind either.
    IF FOUND THEN
        INSERT INTO public.workshop_participant_presence_samples (
            workshop_id,
            participant_id,
            bucket_starts_at,
            is_actively_attending
        )
        VALUES (
            target_workshop_id,
            target_participant_id,
            date_bin(INTERVAL '60 seconds', presence_recorded_at, TIMESTAMPTZ '2000-01-01 00:00:00+00'),
            reported_is_actively_attending
        )
        -- A minute only ever turns from passively into actively attended, and a
        -- heartbeat which would change nothing writes nothing.
        ON CONFLICT (workshop_id, bucket_starts_at, participant_id) DO UPDATE
        SET is_actively_attending = true
        WHERE EXCLUDED.is_actively_attending
          AND NOT workshop_participant_presence_samples.is_actively_attending;
    END IF;

    RETURN;
END;
$$;

-- The timeline splits its audience into the people who were really at their
-- computer and the people who only had the room open. The returned columns change,
-- so the previous body of the function is dropped rather than replaced.
DROP FUNCTION IF EXISTS public.get_workshop_admin_timeline(uuid, integer);

CREATE FUNCTION public.get_workshop_admin_timeline(
    target_workshop_id uuid,
    target_bucket_seconds integer
)
RETURNS TABLE (
    bucket_starts_at timestamptz,
    watching_participant_count bigint,
    actively_watching_participant_count bigint,
    passively_watching_participant_count bigint,
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
        -- A participant is counted once per bucket however many minutes of it they
        -- were seen in, so this is the audience of the bucket and not its heartbeats.
        -- Somebody who was at their computer for one minute of a wider bucket counts
        -- as its active audience, which is what keeps the passive audience the rest
        -- of the people rather than the same people counted twice.
        SELECT
            date_bin(
                make_interval(secs => target_bucket_seconds),
                presence_sample.bucket_starts_at,
                TIMESTAMPTZ '2000-01-01 00:00:00+00'
            ) AS bucket_starts_at,
            count(DISTINCT presence_sample.participant_id)::bigint AS watching_participant_count,
            (
                count(DISTINCT presence_sample.participant_id) FILTER (
                    WHERE presence_sample.is_actively_attending
                )
            )::bigint AS actively_watching_participant_count
        FROM public.workshop_participant_presence_samples AS presence_sample
        WHERE presence_sample.workshop_id = target_workshop_id
        GROUP BY 1
    )
    SELECT
        COALESCE(event_totals.bucket_starts_at, watching_totals.bucket_starts_at),
        COALESCE(watching_totals.watching_participant_count, 0),
        COALESCE(watching_totals.actively_watching_participant_count, 0),
        COALESCE(watching_totals.watching_participant_count, 0)
            - COALESCE(watching_totals.actively_watching_participant_count, 0),
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

REVOKE ALL ON FUNCTION public.record_workshop_participant_presence(uuid, uuid, integer, boolean)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_workshop_participant_presence(uuid, uuid, integer, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) TO service_role;

COMMIT;
