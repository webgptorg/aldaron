-- Workshop participant analytics, trusted moderation, and material link tracking.
--
-- This migration deliberately keeps personal data in the existing RLS-secured
-- tables. Aggregates are exposed only to the service role through functions,
-- so the administration can efficiently display activity without granting a
-- browser direct database access.

BEGIN;

ALTER TABLE public.workshop_participants
    ADD COLUMN IF NOT EXISTS is_trusted boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS active_duration_seconds integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_presence_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.workshop_participants
    DROP CONSTRAINT IF EXISTS workshop_participants_active_duration_seconds;
ALTER TABLE public.workshop_participants
    ADD CONSTRAINT workshop_participants_active_duration_seconds CHECK (active_duration_seconds >= 0);

-- This redundant composite identity lets the click table prove that its
-- content block belongs to the same workshop as the participant.
DO $$
BEGIN
    ALTER TABLE public.workshop_content_blocks
        ADD CONSTRAINT workshop_content_blocks_workshop_identity UNIQUE (id, workshop_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS public.workshop_content_link_clicks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    content_block_id uuid NOT NULL,
    participant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_content_link_clicks_content_fk FOREIGN KEY (content_block_id, workshop_id)
        REFERENCES public.workshop_content_blocks(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_content_link_clicks_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS workshop_content_link_clicks_content_idx
    ON public.workshop_content_link_clicks (workshop_id, content_block_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_content_link_clicks_participant_idx
    ON public.workshop_content_link_clicks (workshop_id, participant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_comments_participant_activity_idx
    ON public.workshop_comments (workshop_id, participant_id)
    WHERE participant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workshop_comment_upvotes_participant_activity_idx
    ON public.workshop_comment_upvotes (workshop_id, participant_id);
CREATE INDEX IF NOT EXISTS workshop_reactions_participant_activity_idx
    ON public.workshop_reactions (workshop_id, participant_id)
    WHERE participant_id IS NOT NULL;

-- The browser reports short visible-page intervals. The database caps each
-- interval by server-observed time, preventing a forged request from inflating
-- the amount of active workshop time.
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
END;
$$;

CREATE OR REPLACE FUNCTION public.get_workshop_participant_activity_totals(target_workshop_id uuid)
RETURNS TABLE (
    participant_id uuid,
    comment_count bigint,
    reaction_count bigint,
    link_click_count bigint,
    upvote_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    WITH comment_totals AS (
        SELECT workshop_comment.participant_id, count(*)::bigint AS comment_count
        FROM public.workshop_comments AS workshop_comment
        WHERE workshop_comment.workshop_id = target_workshop_id
          AND workshop_comment.participant_id IS NOT NULL
        GROUP BY workshop_comment.participant_id
    ), reaction_totals AS (
        SELECT workshop_reaction.participant_id, count(*)::bigint AS reaction_count
        FROM public.workshop_reactions AS workshop_reaction
        WHERE workshop_reaction.workshop_id = target_workshop_id
          AND workshop_reaction.participant_id IS NOT NULL
        GROUP BY workshop_reaction.participant_id
    ), link_click_totals AS (
        SELECT workshop_link_click.participant_id, count(*)::bigint AS link_click_count
        FROM public.workshop_content_link_clicks AS workshop_link_click
        WHERE workshop_link_click.workshop_id = target_workshop_id
        GROUP BY workshop_link_click.participant_id
    ), upvote_totals AS (
        SELECT workshop_upvote.participant_id, count(*)::bigint AS upvote_count
        FROM public.workshop_comment_upvotes AS workshop_upvote
        WHERE workshop_upvote.workshop_id = target_workshop_id
        GROUP BY workshop_upvote.participant_id
    )
    SELECT
        workshop_participant.id,
        COALESCE(comment_totals.comment_count, 0)::bigint,
        COALESCE(reaction_totals.reaction_count, 0)::bigint,
        COALESCE(link_click_totals.link_click_count, 0)::bigint,
        COALESCE(upvote_totals.upvote_count, 0)::bigint
    FROM public.workshop_participants AS workshop_participant
    LEFT JOIN comment_totals ON comment_totals.participant_id = workshop_participant.id
    LEFT JOIN reaction_totals ON reaction_totals.participant_id = workshop_participant.id
    LEFT JOIN link_click_totals ON link_click_totals.participant_id = workshop_participant.id
    LEFT JOIN upvote_totals ON upvote_totals.participant_id = workshop_participant.id
    WHERE workshop_participant.workshop_id = target_workshop_id;
$$;

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
        count(workshop_link_click.id)::bigint
    FROM public.workshop_content_blocks AS workshop_content_block
    LEFT JOIN public.workshop_content_link_clicks AS workshop_link_click
        ON workshop_link_click.content_block_id = workshop_content_block.id
       AND workshop_link_click.workshop_id = workshop_content_block.workshop_id
    WHERE workshop_content_block.workshop_id = target_workshop_id
    GROUP BY workshop_content_block.id;
$$;

ALTER TABLE public.workshop_content_link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_content_link_clicks FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_content_link_clicks FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_content_link_clicks TO service_role;

REVOKE ALL ON FUNCTION public.record_workshop_participant_presence(uuid, uuid, integer)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_participant_activity_totals(uuid)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_content_link_click_totals(uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_workshop_participant_presence(uuid, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_activity_totals(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_content_link_click_totals(uuid) TO service_role;

COMMIT;
