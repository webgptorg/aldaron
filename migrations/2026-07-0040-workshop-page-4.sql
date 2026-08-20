-- The one pinned message of a workshop chat.
--
-- The pin lives on the workshop instead of on the messages, so a room can never
-- end up with two pinned messages and pinning stays a single write which no
-- concurrent moderation can split in half. A deleted message takes its pin with
-- it, and the trigger keeps a pin from ever pointing at a message of another
-- room.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS pinned_comment_id uuid;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_pinned_comment_fk;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_pinned_comment_fk FOREIGN KEY (pinned_comment_id)
        REFERENCES public.workshop_comments(id) ON DELETE SET NULL;

-- Deleting a message clears the pin of its room, which has to find that room
-- through an index instead of a scan over all workshops.
CREATE INDEX IF NOT EXISTS workshops_pinned_comment_idx
    ON public.workshops (pinned_comment_id)
    WHERE pinned_comment_id IS NOT NULL;

-- A pin changes what the chat shows on top, not the workshop itself. Keeping
-- the revision of the workshop untouched keeps the administration from throwing
-- away the settings an admin is typing while pinning a message.
CREATE OR REPLACE FUNCTION public.set_workshop_updated_at_except_pin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF to_jsonb(NEW) - 'pinned_comment_id' - 'updated_at' = to_jsonb(OLD) - 'pinned_comment_id' - 'updated_at' THEN
        NEW.updated_at = OLD.updated_at;
        RETURN NEW;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshops_set_updated_at ON public.workshops;
CREATE TRIGGER workshops_set_updated_at
    BEFORE UPDATE ON public.workshops
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at_except_pin();

REVOKE ALL ON FUNCTION public.set_workshop_updated_at_except_pin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_workshop_updated_at_except_pin() TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_workshop_pinned_comment_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.pinned_comment_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_comments AS pinned_comment
        WHERE pinned_comment.id = NEW.pinned_comment_id
          AND pinned_comment.workshop_id = NEW.id
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_PINNED_COMMENT_FOREIGN';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshops_enforce_pinned_comment_identity ON public.workshops;
CREATE TRIGGER workshops_enforce_pinned_comment_identity
    BEFORE INSERT OR UPDATE OF pinned_comment_id ON public.workshops
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_pinned_comment_identity();

REVOKE ALL ON FUNCTION public.enforce_workshop_pinned_comment_identity() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_pinned_comment_identity() TO service_role;

COMMIT;
