-- The audience curve and the reaction breakdown of the workshop overview graph.
--
-- A room already records every action of its participants, but never who was
-- watching at a given minute, so an audience over time could only be guessed from
-- the moment somebody registered. The presence heartbeat the room already sends
-- now also leaves one row per participant and minute, which is exactly what the
-- audience curve is counted from. Everything else the graph draws stays an
-- aggregate of the audited tables, so no activity is copied into a second store.

BEGIN;

-- One row per participant and minute they had the room open. The primary key is
-- the whole row, so a heartbeat which arrives twice within the same minute is
-- written once and the table grows with watched minutes rather than with requests.
CREATE TABLE IF NOT EXISTS public.workshop_participant_presence_samples (
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL,
    bucket_starts_at timestamptz NOT NULL,
    PRIMARY KEY (workshop_id, bucket_starts_at, participant_id),
    CONSTRAINT workshop_participant_presence_samples_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS workshop_participant_presence_samples_participant_idx
    ON public.workshop_participant_presence_samples (workshop_id, participant_id);

ALTER TABLE public.workshop_participant_presence_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_participant_presence_samples FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_participant_presence_samples FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_participant_presence_samples TO service_role;

-- The browser reports short visible-page intervals. The database caps each
-- interval by server-observed time, preventing a forged request from inflating
-- the amount of active workshop time, and remembers the minute itself so the
-- administration can draw how many people were in the room at that time.
CREATE OR REPLACE FUNCTION public.record_workshop_participant_presence(
    target_workshop_id uuid,
    target_participant_id uuid,
    reported_active_duration_seconds integer
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
            bucket_starts_at
        )
        VALUES (
            target_workshop_id,
            target_participant_id,
            date_bin(INTERVAL '60 seconds', presence_recorded_at, TIMESTAMPTZ '2000-01-01 00:00:00+00')
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN;
END;
$$;

-- The timeline gains the audience of every bucket, and a minute-long bucket for
-- the hour-long workshops the graph is drawn for. The returned columns change, so
-- the previous body of the function is dropped rather than replaced.
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

-- Which reaction was sent when, so the graph can draw one chosen emoji instead of
-- every reaction at once. The emoji breakdown is a table of its own rather than a
-- column of the timeline, because a room may offer any number of reactions.
CREATE OR REPLACE FUNCTION public.get_workshop_admin_reaction_timeline(
    target_workshop_id uuid,
    target_bucket_seconds integer
)
RETURNS TABLE (
    bucket_starts_at timestamptz,
    emoji text,
    reaction_count bigint
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
    SELECT
        date_bin(
            make_interval(secs => target_bucket_seconds),
            workshop_reaction.created_at,
            TIMESTAMPTZ '2000-01-01 00:00:00+00'
        ) AS bucket_starts_at,
        workshop_reaction.emoji,
        count(*)::bigint AS reaction_count
    FROM public.workshop_reactions AS workshop_reaction
    WHERE workshop_reaction.workshop_id = target_workshop_id
    GROUP BY 1, 2
    ORDER BY 1 ASC, 2 ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_admin_timeline(uuid, integer)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_admin_reaction_timeline(uuid, integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_admin_reaction_timeline(uuid, integer) TO service_role;

COMMIT;
