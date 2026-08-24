-- The material selected for the end-of-workshop wrap-up and the feedback which
-- belongs to the participant who submitted it.
--
-- A follow-up remains an ordinary content block. Its flag only decides the
-- treatment of that one block in the participant room; the partial unique index
-- and trigger make the selection atomic just like the pinned chat message.

BEGIN;

ALTER TABLE public.workshop_content_blocks
    ADD COLUMN IF NOT EXISTS is_follow_up boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS workshop_content_blocks_one_follow_up_per_workshop
    ON public.workshop_content_blocks (workshop_id)
    WHERE is_follow_up;

CREATE OR REPLACE FUNCTION public.select_workshop_follow_up_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.is_follow_up THEN
        UPDATE public.workshop_content_blocks
        SET is_follow_up = false
        WHERE workshop_id = NEW.workshop_id
          AND id <> NEW.id
          AND is_follow_up;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_content_blocks_select_follow_up ON public.workshop_content_blocks;
CREATE TRIGGER workshop_content_blocks_select_follow_up
    BEFORE INSERT OR UPDATE OF is_follow_up ON public.workshop_content_blocks
    FOR EACH ROW EXECUTE FUNCTION public.select_workshop_follow_up_content();

CREATE TABLE IF NOT EXISTS public.workshop_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL,
    rating smallint NOT NULL,
    what_was_good text,
    what_was_bad text,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_feedback_one_per_participant UNIQUE (workshop_id, participant_id),
    CONSTRAINT workshop_feedback_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_feedback_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT workshop_feedback_what_was_good_length CHECK (
        what_was_good IS NULL OR char_length(what_was_good) <= 5000
    ),
    CONSTRAINT workshop_feedback_what_was_bad_length CHECK (
        what_was_bad IS NULL OR char_length(what_was_bad) <= 5000
    ),
    CONSTRAINT workshop_feedback_note_length CHECK (note IS NULL OR char_length(note) <= 5000)
);

CREATE INDEX IF NOT EXISTS workshop_feedback_workshop_updated_idx
    ON public.workshop_feedback (workshop_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS workshop_feedback_participant_updated_idx
    ON public.workshop_feedback (participant_id, updated_at DESC);

DROP TRIGGER IF EXISTS workshop_feedback_set_updated_at ON public.workshop_feedback;
CREATE TRIGGER workshop_feedback_set_updated_at
    BEFORE UPDATE ON public.workshop_feedback
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

ALTER TABLE public.workshop_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_feedback FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_feedback FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_feedback TO service_role;

REVOKE ALL ON FUNCTION public.select_workshop_follow_up_content() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.select_workshop_follow_up_content() TO service_role;

COMMIT;
