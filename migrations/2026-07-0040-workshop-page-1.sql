-- Moderation and artificial workshop activity.
--
-- Artificial records deliberately have no participant identity. This keeps
-- them auditable and prevents them from being confused with participant
-- actions in both the database and administration.

BEGIN;

ALTER TABLE public.workshop_participants
    ADD COLUMN IF NOT EXISTS is_interaction_banned boolean NOT NULL DEFAULT false;

ALTER TABLE public.workshop_comments
    ADD COLUMN IF NOT EXISTS is_artificial boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS artificial_upvote_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.workshop_comments
    ALTER COLUMN participant_id DROP NOT NULL;

ALTER TABLE public.workshop_comments
    DROP CONSTRAINT IF EXISTS workshop_comments_artificial_participant_identity;
ALTER TABLE public.workshop_comments
    ADD CONSTRAINT workshop_comments_artificial_participant_identity CHECK (
        (is_artificial AND participant_id IS NULL)
        OR (NOT is_artificial AND participant_id IS NOT NULL)
    );

ALTER TABLE public.workshop_comments
    DROP CONSTRAINT IF EXISTS workshop_comments_artificial_upvote_count;
ALTER TABLE public.workshop_comments
    ADD CONSTRAINT workshop_comments_artificial_upvote_count CHECK (
        artificial_upvote_count BETWEEN -1000000 AND 1000000
    );

ALTER TABLE public.workshop_reactions
    ADD COLUMN IF NOT EXISTS is_artificial boolean NOT NULL DEFAULT false;

ALTER TABLE public.workshop_reactions
    ALTER COLUMN participant_id DROP NOT NULL;

ALTER TABLE public.workshop_reactions
    DROP CONSTRAINT IF EXISTS workshop_reactions_artificial_participant_identity;
ALTER TABLE public.workshop_reactions
    ADD CONSTRAINT workshop_reactions_artificial_participant_identity CHECK (
        (is_artificial AND participant_id IS NULL)
        OR (NOT is_artificial AND participant_id IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS workshop_comments_participant_pending_idx
    ON public.workshop_comments (workshop_id, participant_id, created_at DESC)
    WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.adjust_workshop_comment_artificial_upvotes(
    target_workshop_id uuid,
    target_comment_id uuid,
    artificial_upvote_adjustment integer
)
RETURNS TABLE (
    comment_id uuid,
    upvote_count integer,
    artificial_upvote_count integer
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.workshop_comments AS workshop_comment
    SET artificial_upvote_count = workshop_comment.artificial_upvote_count + artificial_upvote_adjustment
    WHERE workshop_comment.id = target_comment_id
      AND workshop_comment.workshop_id = target_workshop_id
    RETURNING workshop_comment.id, workshop_comment.upvote_count, workshop_comment.artificial_upvote_count;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_workshop_comment_artificial_upvotes(uuid, uuid, integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_workshop_comment_artificial_upvotes(uuid, uuid, integer) TO service_role;

-- Artificial records are not participant actions and therefore do not use
-- participant rate-limit locks.
CREATE OR REPLACE FUNCTION public.enforce_workshop_comment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.is_artificial THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended('workshop-comment:' || NEW.participant_id::text, 0));

    IF EXISTS (
        SELECT 1
        FROM public.workshop_comments AS recent_comment
        WHERE recent_comment.participant_id = NEW.participant_id
          AND recent_comment.created_at >= clock_timestamp() - interval '3 seconds'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_COMMENT_RATE_LIMITED';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_workshop_reaction_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    recent_reaction_count integer;
BEGIN
    IF NEW.is_artificial THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended('workshop-reaction:' || NEW.participant_id::text, 0));

    SELECT count(*)
    INTO recent_reaction_count
    FROM public.workshop_reactions AS recent_reaction
    WHERE recent_reaction.participant_id = NEW.participant_id
      AND recent_reaction.created_at >= clock_timestamp() - interval '2 seconds';

    IF recent_reaction_count >= 6 THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_REACTION_RATE_LIMITED';
    END IF;

    RETURN NEW;
END;
$$;

COMMIT;
