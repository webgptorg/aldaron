-- The live count of the people watching a workshop and the replies in its chat.
--
-- Every state reload and every presence heartbeat counts the participants seen
-- within the watching window, so that count has to be answered from an index
-- instead of a scan over all participants of the workshop.
--
-- A reply is an ordinary comment which points at the comment it answers, so it
-- keeps the very same moderation, rate limiting, and upvoting as any other
-- comment. The chat stays exactly one level deep, which keeps a thread readable
-- in the narrow chat column and keeps the room from rendering an unbounded tree.

BEGIN;

CREATE INDEX IF NOT EXISTS workshop_participants_watching_idx
    ON public.workshop_participants (workshop_id, last_seen_at DESC);

ALTER TABLE public.workshop_comments
    ADD COLUMN IF NOT EXISTS parent_comment_id uuid;

-- The composite reference proves that a reply answers a comment of the same
-- workshop, and the cascade takes the replies with a deleted parent.
ALTER TABLE public.workshop_comments
    DROP CONSTRAINT IF EXISTS workshop_comments_parent_fk;
ALTER TABLE public.workshop_comments
    ADD CONSTRAINT workshop_comments_parent_fk FOREIGN KEY (parent_comment_id, workshop_id)
        REFERENCES public.workshop_comments(id, workshop_id) ON DELETE CASCADE;

ALTER TABLE public.workshop_comments
    DROP CONSTRAINT IF EXISTS workshop_comments_parent_is_another_comment;
ALTER TABLE public.workshop_comments
    ADD CONSTRAINT workshop_comments_parent_is_another_comment CHECK (
        parent_comment_id IS NULL OR parent_comment_id <> id
    );

CREATE INDEX IF NOT EXISTS workshop_comments_replies_idx
    ON public.workshop_comments (workshop_id, parent_comment_id, created_at)
    WHERE parent_comment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.enforce_workshop_comment_reply_depth()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.parent_comment_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.workshop_comments AS parent_comment
        WHERE parent_comment.id = NEW.parent_comment_id
          AND parent_comment.parent_comment_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_COMMENT_REPLY_TOO_DEEP';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_comments_enforce_reply_depth ON public.workshop_comments;
CREATE TRIGGER workshop_comments_enforce_reply_depth
    BEFORE INSERT OR UPDATE OF parent_comment_id ON public.workshop_comments
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_comment_reply_depth();

REVOKE ALL ON FUNCTION public.enforce_workshop_comment_reply_depth() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_comment_reply_depth() TO service_role;

COMMIT;
