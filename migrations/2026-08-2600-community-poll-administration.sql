-- Full administration of the permanent community's polls.
--
-- Poll answers remain attributable to a member only in the private vote table. Seeded votes are deliberately stored
-- as an aggregate on an option, which lets an administrator prepare social proof without inventing a participant or
-- weakening the one-vote-per-member constraint.

BEGIN;

ALTER TABLE public.workshop_polls
    ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.workshop_poll_options
    ADD COLUMN IF NOT EXISTS artificial_vote_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.workshop_poll_options
    DROP CONSTRAINT IF EXISTS workshop_poll_options_artificial_vote_count;

ALTER TABLE public.workshop_poll_options
    ADD CONSTRAINT workshop_poll_options_artificial_vote_count CHECK (
        artificial_vote_count BETWEEN 0 AND 1000000
    );

-- Reopening is now an explicit administrative setting. The community-only ownership rule remains database-enforced
-- even for direct service-role callers.
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

    RETURN NEW;
END;
$$;

-- Hidden polls are as unavailable for a member vote as closed polls. The row lock continues to serialize an
-- administrator's visibility/lifecycle change with a concurrent member vote.
CREATE OR REPLACE FUNCTION public.enforce_workshop_poll_vote_open()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    poll_is_closed boolean;
    poll_is_visible boolean;
BEGIN
    SELECT poll.is_closed, poll.is_visible
    INTO poll_is_closed, poll_is_visible
    FROM public.workshop_polls AS poll
    WHERE poll.id = NEW.poll_id
      AND poll.workshop_id = NEW.workshop_id
    FOR SHARE;

    IF NOT FOUND OR poll_is_closed OR NOT poll_is_visible THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_CLOSED';
    END IF;

    RETURN NEW;
END;
$$;

-- Creation can start hidden and/or closed, which makes it possible to seed its aggregate before members see it.
DROP FUNCTION IF EXISTS public.create_community_workshop_poll(uuid, text, text[]);

CREATE FUNCTION public.create_community_workshop_poll(
    target_workshop_id uuid,
    target_question text,
    target_options text[],
    target_is_closed boolean,
    target_is_visible boolean
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

    IF target_is_closed IS NULL OR target_is_visible IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_SETTINGS_INVALID';
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

    INSERT INTO public.workshop_polls (workshop_id, question, is_closed, is_visible)
    VALUES (target_workshop_id, btrim(target_question), target_is_closed, target_is_visible)
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

-- One transaction writes question, lifecycle, visibility, retained choices and new choices together. Existing option
-- IDs stay stable, so their votes do too; an omitted ID deliberately removes that choice and its dependent votes.
CREATE OR REPLACE FUNCTION public.update_community_workshop_poll(
    target_workshop_id uuid,
    target_poll_id uuid,
    target_question text,
    target_options jsonb,
    target_is_closed boolean,
    target_is_visible boolean
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    locked_poll_id uuid;
BEGIN
    IF target_question IS NULL OR char_length(btrim(target_question)) NOT BETWEEN 1 AND 500 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_QUESTION_INVALID';
    END IF;

    IF target_options IS NULL
        OR jsonb_typeof(target_options) <> 'array'
        OR jsonb_array_length(target_options) NOT BETWEEN 2 AND 8 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    IF target_is_closed IS NULL OR target_is_visible IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_SETTINGS_INVALID';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        WHERE jsonb_typeof(target_option.value) <> 'object'
           OR NOT (target_option.value ? 'label')
           OR jsonb_typeof(target_option.value -> 'label') <> 'string'
           OR char_length(btrim(target_option.value ->> 'label')) NOT BETWEEN 1 AND 200
           OR (
               target_option.value ? 'id'
               AND (
                   jsonb_typeof(target_option.value -> 'id') <> 'string'
                   OR (target_option.value ->> 'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
               )
           )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        GROUP BY lower(btrim(target_option.value ->> 'label'))
        HAVING count(*) > 1
    ) OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        WHERE target_option.value ? 'id'
        GROUP BY target_option.value ->> 'id'
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    SELECT poll.id
    INTO locked_poll_id
    FROM public.workshop_polls AS poll
    INNER JOIN public.workshops AS workshop
        ON workshop.id = poll.workshop_id
    WHERE poll.id = target_poll_id
      AND poll.workshop_id = target_workshop_id
      AND workshop.room_kind = 'community'
    FOR UPDATE OF poll;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_FOUND';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        WHERE target_option.value ? 'id'
          AND NOT EXISTS (
              SELECT 1
              FROM public.workshop_poll_options AS existing_option
              WHERE existing_option.id = (target_option.value ->> 'id')::uuid
                AND existing_option.poll_id = locked_poll_id
          )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTION_INVALID';
    END IF;

    UPDATE public.workshop_polls
    SET
        question = btrim(target_question),
        is_closed = target_is_closed,
        is_visible = target_is_visible
    WHERE id = locked_poll_id;

    -- Move existing positions out of the desired 0–7 range before reassigning them, so the unique `(poll_id,
    -- sort_order)` constraint also protects a simple reordering.
    UPDATE public.workshop_poll_options
    SET sort_order = sort_order + 1000
    WHERE poll_id = locked_poll_id;

    DELETE FROM public.workshop_poll_options AS existing_option
    WHERE existing_option.poll_id = locked_poll_id
      AND NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(target_options) AS target_option(value)
          WHERE target_option.value ? 'id'
            AND (target_option.value ->> 'id')::uuid = existing_option.id
      );

    UPDATE public.workshop_poll_options AS existing_option
    SET
        label = btrim(target_option.value ->> 'label'),
        sort_order = (target_option.position - 1)::integer
    FROM jsonb_array_elements(target_options) WITH ORDINALITY AS target_option(value, position)
    WHERE target_option.value ? 'id'
      AND existing_option.poll_id = locked_poll_id
      AND existing_option.id = (target_option.value ->> 'id')::uuid;

    INSERT INTO public.workshop_poll_options (poll_id, label, sort_order)
    SELECT
        locked_poll_id,
        btrim(target_option.value ->> 'label'),
        (target_option.position - 1)::integer
    FROM jsonb_array_elements(target_options) WITH ORDINALITY AS target_option(value, position)
    WHERE NOT (target_option.value ? 'id');

    RETURN locked_poll_id;
END;
$$;

-- Adjusting is atomic and bounded. A negative adjustment corrects an accidental seed but can never make a displayed
-- option result negative.
CREATE OR REPLACE FUNCTION public.adjust_community_workshop_poll_option_artificial_votes(
    target_workshop_id uuid,
    target_poll_id uuid,
    target_option_id uuid,
    target_adjustment integer
)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    current_artificial_vote_count integer;
    next_artificial_vote_count integer;
BEGIN
    IF target_adjustment IS NULL
        OR target_adjustment = 0
        OR target_adjustment NOT BETWEEN -1000000 AND 1000000 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_ARTIFICIAL_VOTES_INVALID';
    END IF;

    SELECT poll_option.artificial_vote_count
    INTO current_artificial_vote_count
    FROM public.workshop_poll_options AS poll_option
    INNER JOIN public.workshop_polls AS poll
        ON poll.id = poll_option.poll_id
    INNER JOIN public.workshops AS workshop
        ON workshop.id = poll.workshop_id
    WHERE poll_option.id = target_option_id
      AND poll_option.poll_id = target_poll_id
      AND poll.workshop_id = target_workshop_id
      AND workshop.room_kind = 'community'
    FOR UPDATE OF poll_option;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OPTION_NOT_FOUND';
    END IF;

    next_artificial_vote_count = current_artificial_vote_count + target_adjustment;
    IF next_artificial_vote_count NOT BETWEEN 0 AND 1000000 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_ARTIFICIAL_VOTES_INVALID';
    END IF;

    UPDATE public.workshop_poll_options
    SET artificial_vote_count = next_artificial_vote_count
    WHERE id = target_option_id
      AND poll_id = target_poll_id;

    RETURN next_artificial_vote_count;
END;
$$;

REVOKE ALL ON FUNCTION public.create_community_workshop_poll(uuid, text, text[], boolean, boolean)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.adjust_community_workshop_poll_option_artificial_votes(uuid, uuid, uuid, integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_community_workshop_poll(uuid, text, text[], boolean, boolean)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.adjust_community_workshop_poll_option_artificial_votes(uuid, uuid, uuid, integer)
    TO service_role;

COMMIT;
