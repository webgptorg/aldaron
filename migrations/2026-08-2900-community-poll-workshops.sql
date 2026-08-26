-- Attaching a community poll to workshop occurrences.
--
-- A poll keeps belonging to the one community which administers it, so its votes, its options and its aggregate stay
-- exactly where they were. What is added here is which workshop occurrences a poll is about, which lets the community
-- ask a question about a concrete workshop and lets the administration of that workshop see the question asked about
-- it. The attachment is deliberately many-to-many: one poll can compare several occurrences and one occurrence can be
-- the subject of more than one poll.

BEGIN;

CREATE TABLE IF NOT EXISTS public.workshop_poll_workshops (
    poll_id uuid NOT NULL REFERENCES public.workshop_polls(id) ON DELETE CASCADE,
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (poll_id, workshop_id)
);

-- The administration of one occurrence reads every poll attached to it, which is the opposite direction of the
-- primary key.
CREATE INDEX IF NOT EXISTS workshop_poll_workshops_workshop_idx
    ON public.workshop_poll_workshops (workshop_id);

-- A community owns the poll, and only a workshop occurrence can be its subject. Both facts are checked here as well
-- as in the request schema so a direct service-role write cannot make a project or another kind of room appear as an
-- attached workshop.
CREATE OR REPLACE FUNCTION public.enforce_community_workshop_poll_attachment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_polls AS poll
        INNER JOIN public.workshops AS community
            ON community.id = poll.workshop_id
        WHERE poll.id = NEW.poll_id
          AND community.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OWNER_INVALID';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshops AS workshop
        WHERE workshop.id = NEW.workshop_id
          AND workshop.room_kind = 'workshop'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_WORKSHOP_INVALID';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_poll_workshops_enforce_kind ON public.workshop_poll_workshops;
CREATE TRIGGER workshop_poll_workshops_enforce_kind
    BEFORE INSERT OR UPDATE OF poll_id, workshop_id ON public.workshop_poll_workshops
    FOR EACH ROW EXECUTE FUNCTION public.enforce_community_workshop_poll_attachment();

-- Creating and changing a poll write their attachments through this one function, so both of them accept exactly the
-- same list and leave exactly the same rows behind.
CREATE OR REPLACE FUNCTION public.write_community_workshop_poll_workshops(
    target_poll_id uuid,
    target_attached_workshop_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF target_attached_workshop_ids IS NULL
        OR cardinality(target_attached_workshop_ids) > 20
        OR EXISTS (
            SELECT 1
            FROM unnest(target_attached_workshop_ids) AS attached(workshop_id)
            WHERE attached.workshop_id IS NULL
        )
        OR (
            SELECT count(*) <> count(DISTINCT attached.workshop_id)
            FROM unnest(target_attached_workshop_ids) AS attached(workshop_id)
        ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_WORKSHOPS_INVALID';
    END IF;

    DELETE FROM public.workshop_poll_workshops AS attachment
    WHERE attachment.poll_id = target_poll_id
      AND NOT (attachment.workshop_id = ANY(target_attached_workshop_ids));

    INSERT INTO public.workshop_poll_workshops (poll_id, workshop_id)
    SELECT target_poll_id, attached.workshop_id
    FROM unnest(target_attached_workshop_ids) AS attached(workshop_id)
    ON CONFLICT (poll_id, workshop_id) DO NOTHING;
END;
$$;

-- Creation stays one transaction: a poll never exists for a moment without the choices and the occurrences it was
-- created with.
DROP FUNCTION IF EXISTS public.create_community_workshop_poll(uuid, text, text[], boolean, boolean);

CREATE FUNCTION public.create_community_workshop_poll(
    target_workshop_id uuid,
    target_question text,
    target_options text[],
    target_is_closed boolean,
    target_is_visible boolean,
    target_attached_workshop_ids uuid[]
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

    PERFORM public.write_community_workshop_poll_workshops(created_poll_id, target_attached_workshop_ids);

    RETURN created_poll_id;
END;
$$;

-- The very same transaction which rewrites the question, the lifecycle and the choices also rewrites which
-- occurrences the poll is about, so an administration never shows a half-saved poll.
DROP FUNCTION IF EXISTS public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean);

CREATE FUNCTION public.update_community_workshop_poll(
    target_workshop_id uuid,
    target_poll_id uuid,
    target_question text,
    target_options jsonb,
    target_is_closed boolean,
    target_is_visible boolean,
    target_attached_workshop_ids uuid[]
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

    -- Move existing positions out of the desired 0–7 range before reassigning them, so the unique poll/position
    -- constraint also protects a simple reordering.
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

    PERFORM public.write_community_workshop_poll_workshops(locked_poll_id, target_attached_workshop_ids);

    RETURN locked_poll_id;
END;
$$;

ALTER TABLE public.workshop_poll_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_poll_workshops FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.workshop_poll_workshops FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_poll_workshops TO service_role;

REVOKE ALL ON FUNCTION public.enforce_community_workshop_poll_attachment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.write_community_workshop_poll_workshops(uuid, uuid[])
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_community_workshop_poll(uuid, text, text[], boolean, boolean, uuid[])
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, uuid[])
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_community_workshop_poll_attachment() TO service_role;
GRANT EXECUTE ON FUNCTION public.write_community_workshop_poll_workshops(uuid, uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_community_workshop_poll(uuid, text, text[], boolean, boolean, uuid[])
    TO service_role;
GRANT EXECUTE ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, uuid[])
    TO service_role;

COMMIT;
