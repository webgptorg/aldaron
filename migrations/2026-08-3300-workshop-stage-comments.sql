-- The one question currently shown on the stage of a live workshop.
--
-- A stage question points at the ordinary workshop comment which supplied it.
-- That keeps the chat and the live presentation on one source record: an
-- attendee question can be selected directly, while an artificial question is
-- an explicitly marked artificial comment before it reaches the stage.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS stage_comment_id uuid;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_stage_comment_fk;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_stage_comment_fk FOREIGN KEY (stage_comment_id)
        REFERENCES public.workshop_comments(id) ON DELETE SET NULL;

-- Deleting a selected question clears the stage through its foreign key. The
-- partial index makes that lookup stay small when the workshop archive grows.
CREATE INDEX IF NOT EXISTS workshops_stage_comment_idx
    ON public.workshops (stage_comment_id)
    WHERE stage_comment_id IS NOT NULL;

-- A stage selection, like the chat pin, changes the live room rather than its
-- settings. Keeping the workshop revision stable avoids replacing a settings
-- form which an administrator is currently writing in another tab.
CREATE OR REPLACE FUNCTION public.set_workshop_updated_at_except_pin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF to_jsonb(NEW) - 'pinned_comment_id' - 'stage_comment_id' - 'updated_at'
        = to_jsonb(OLD) - 'pinned_comment_id' - 'stage_comment_id' - 'updated_at' THEN
        NEW.updated_at = OLD.updated_at;
        RETURN NEW;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_workshop_updated_at_except_pin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_workshop_updated_at_except_pin() TO service_role;

-- The primary key reference above proves that this is a comment; this trigger
-- also proves that it belongs to this workshop, is not rejected, and that only
-- an actual live workshop can hold a question over a stage.
CREATE OR REPLACE FUNCTION public.enforce_workshop_stage_comment_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.stage_comment_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.room_kind <> 'workshop' OR NOT EXISTS (
        SELECT 1
        FROM public.workshop_comments AS stage_comment
        WHERE stage_comment.id = NEW.stage_comment_id
          AND stage_comment.workshop_id = NEW.id
          AND stage_comment.status <> 'rejected'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_STAGE_COMMENT_INVALID';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshops_enforce_stage_comment_identity ON public.workshops;
CREATE TRIGGER workshops_enforce_stage_comment_identity
    BEFORE INSERT OR UPDATE OF stage_comment_id, room_kind ON public.workshops
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_stage_comment_identity();

REVOKE ALL ON FUNCTION public.enforce_workshop_stage_comment_identity() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_stage_comment_identity() TO service_role;

-- A message rejected after it was selected must leave the stage immediately;
-- otherwise moderation and the audience would disagree about whether it is
-- still visible. The conditional update never clears a newer question.
CREATE OR REPLACE FUNCTION public.clear_rejected_workshop_stage_comment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM NEW.status THEN
        UPDATE public.workshops
        SET stage_comment_id = NULL
        WHERE id = NEW.workshop_id
          AND stage_comment_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_comments_clear_rejected_stage_comment ON public.workshop_comments;
CREATE TRIGGER workshop_comments_clear_rejected_stage_comment
    AFTER UPDATE OF status ON public.workshop_comments
    FOR EACH ROW EXECUTE FUNCTION public.clear_rejected_workshop_stage_comment();

REVOKE ALL ON FUNCTION public.clear_rejected_workshop_stage_comment() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.clear_rejected_workshop_stage_comment() TO service_role;

COMMIT;
