-- Polls of the permanent community.
--
-- The participant room remains the sole public boundary: members can only vote through their authenticated room
-- session, receive aggregate counts, and never receive the identities behind another member's vote. The storage is
-- nevertheless named after workshops because it deliberately reuses the shared room model rather than creating a
-- parallel community database.

BEGIN;

CREATE TABLE IF NOT EXISTS public.workshop_polls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    question text NOT NULL,
    is_closed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_polls_question_length CHECK (char_length(question) BETWEEN 1 AND 500),
    CONSTRAINT workshop_polls_workshop_identity UNIQUE (id, workshop_id)
);

CREATE TABLE IF NOT EXISTS public.workshop_poll_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES public.workshop_polls(id) ON DELETE CASCADE,
    label text NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_poll_options_label_length CHECK (char_length(label) BETWEEN 1 AND 200),
    CONSTRAINT workshop_poll_options_order_unique UNIQUE (poll_id, sort_order),
    CONSTRAINT workshop_poll_options_poll_identity UNIQUE (id, poll_id)
);

CREATE TABLE IF NOT EXISTS public.workshop_poll_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL,
    poll_id uuid NOT NULL,
    option_id uuid NOT NULL,
    participant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_poll_votes_one_per_participant UNIQUE (poll_id, participant_id),
    CONSTRAINT workshop_poll_votes_poll_fk FOREIGN KEY (poll_id, workshop_id)
        REFERENCES public.workshop_polls(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_poll_votes_option_fk FOREIGN KEY (option_id, poll_id)
        REFERENCES public.workshop_poll_options(id, poll_id) ON DELETE CASCADE,
    CONSTRAINT workshop_poll_votes_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS workshop_polls_recent_idx
    ON public.workshop_polls (workshop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_poll_options_order_idx
    ON public.workshop_poll_options (poll_id, sort_order ASC);
CREATE INDEX IF NOT EXISTS workshop_poll_votes_option_idx
    ON public.workshop_poll_votes (poll_id, option_id);

-- A poll belongs to the one community only. This is guarded in the database as well as in the administration route, so
-- a future caller cannot accidentally add polls to a one-off workshop that does not offer them to participants.
CREATE OR REPLACE FUNCTION public.enforce_community_workshop_poll()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshops AS workshop
        WHERE workshop.id = NEW.workshop_id
          AND workshop.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_COMMUNITY';
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.is_closed AND NOT NEW.is_closed THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_CANNOT_REOPEN';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_polls_enforce_community ON public.workshop_polls;
CREATE TRIGGER workshop_polls_enforce_community
    BEFORE INSERT OR UPDATE OF workshop_id, is_closed ON public.workshop_polls
    FOR EACH ROW EXECUTE FUNCTION public.enforce_community_workshop_poll();

-- Checking a poll at the HTTP boundary cannot close the small race with an administrator ending it at the same time.
-- This trigger makes that race safe for both first votes and changed votes.
CREATE OR REPLACE FUNCTION public.enforce_workshop_poll_vote_open()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    poll_is_closed boolean;
BEGIN
    -- A shared row lock serializes this decision with the administrator's update which closes the poll. Without it,
    -- an uncommitted close could still look open to a concurrent vote until both requests had already succeeded.
    SELECT poll.is_closed
    INTO poll_is_closed
    FROM public.workshop_polls AS poll
    WHERE poll.id = NEW.poll_id
      AND poll.workshop_id = NEW.workshop_id
    FOR SHARE;

    IF NOT FOUND OR poll_is_closed THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_CLOSED';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_poll_votes_enforce_open_poll ON public.workshop_poll_votes;
CREATE TRIGGER workshop_poll_votes_enforce_open_poll
    BEFORE INSERT OR UPDATE OF poll_id, option_id, workshop_id ON public.workshop_poll_votes
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_poll_vote_open();

DROP TRIGGER IF EXISTS workshop_polls_set_updated_at ON public.workshop_polls;
CREATE TRIGGER workshop_polls_set_updated_at
    BEFORE UPDATE ON public.workshop_polls
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

DROP TRIGGER IF EXISTS workshop_poll_votes_set_updated_at ON public.workshop_poll_votes;
CREATE TRIGGER workshop_poll_votes_set_updated_at
    BEFORE UPDATE ON public.workshop_poll_votes
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

-- Creating a poll and all of its choices is one transaction. A browser never sees an incomplete question with no
-- answers if an option insertion fails midway through an administrative request.
CREATE OR REPLACE FUNCTION public.create_community_workshop_poll(
    target_workshop_id uuid,
    target_question text,
    target_options text[]
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    created_poll_id uuid;
BEGIN
    IF target_question IS NULL OR char_length(btrim(target_question)) NOT BETWEEN 1 AND 500 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_QUESTION_INVALID';
    END IF;

    IF target_options IS NULL OR cardinality(target_options) NOT BETWEEN 2 AND 8 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM unnest(target_options) AS poll_option(label)
        WHERE poll_option.label IS NULL OR char_length(btrim(poll_option.label)) NOT BETWEEN 1 AND 200
    ) OR EXISTS (
        SELECT 1
        FROM unnest(target_options) AS poll_option(label)
        GROUP BY lower(btrim(poll_option.label))
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    INSERT INTO public.workshop_polls (workshop_id, question)
    VALUES (target_workshop_id, btrim(target_question))
    RETURNING id INTO created_poll_id;

    INSERT INTO public.workshop_poll_options (poll_id, label, sort_order)
    SELECT
        created_poll_id,
        btrim(poll_option.label),
        (poll_option.position - 1)::integer
    FROM unnest(target_options) WITH ORDINALITY AS poll_option(label, position);

    RETURN created_poll_id;
END;
$$;

-- Aggregate in PostgreSQL instead of sending every private vote through the server just to count it in JavaScript.
CREATE OR REPLACE FUNCTION public.get_workshop_poll_option_vote_counts(target_poll_ids uuid[])
RETURNS TABLE (
    option_id uuid,
    vote_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        poll_option.id,
        count(poll_vote.id)::bigint
    FROM public.workshop_poll_options AS poll_option
    LEFT JOIN public.workshop_poll_votes AS poll_vote
        ON poll_vote.option_id = poll_option.id
       AND poll_vote.poll_id = poll_option.poll_id
    WHERE poll_option.poll_id = ANY(target_poll_ids)
    GROUP BY poll_option.id;
$$;

ALTER TABLE public.workshop_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_polls FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_poll_options FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_poll_votes FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.workshop_polls FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.workshop_poll_options FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.workshop_poll_votes FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_polls TO service_role;
GRANT ALL ON TABLE public.workshop_poll_options TO service_role;
GRANT ALL ON TABLE public.workshop_poll_votes TO service_role;

REVOKE ALL ON FUNCTION public.enforce_community_workshop_poll() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_workshop_poll_vote_open() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_community_workshop_poll(uuid, text, text[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_poll_option_vote_counts(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_community_workshop_poll() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_poll_vote_open() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_community_workshop_poll(uuid, text, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_poll_option_vote_counts(uuid[]) TO service_role;

COMMIT;
