-- Totals beside every reaction in a workshop room.
--
-- The aggregate is loaded once with the room state, then each new reaction carries
-- its exact total over the private realtime channel. Keeping the write and the
-- count in one database operation avoids a browser guessing at totals while many
-- participants react at the same time.

BEGIN;

CREATE INDEX IF NOT EXISTS workshop_reactions_emoji_count_idx
    ON public.workshop_reactions (workshop_id, emoji);

CREATE OR REPLACE FUNCTION public.get_workshop_reaction_counts(target_workshop_id uuid)
RETURNS TABLE (
    emoji text,
    reaction_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        workshop_reaction.emoji,
        count(*)::bigint AS reaction_count
    FROM public.workshop_reactions AS workshop_reaction
    WHERE workshop_reaction.workshop_id = target_workshop_id
    GROUP BY workshop_reaction.emoji;
$$;

CREATE OR REPLACE FUNCTION public.create_workshop_reaction(
    target_workshop_id uuid,
    target_participant_id uuid,
    target_emoji text
)
RETURNS TABLE (
    id uuid,
    emoji text,
    created_at timestamptz,
    reaction_count bigint
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    created_reaction public.workshop_reactions%ROWTYPE;
    total_reaction_count bigint;
BEGIN
    -- The total is returned to the room immediately, so writers of the same
    -- reaction serialize long enough to count every committed action exactly.
    PERFORM pg_advisory_xact_lock(
        hashtextextended(
            'workshop-reaction-count:' || target_workshop_id::text || ':' || target_emoji,
            0
        )
    );

    INSERT INTO public.workshop_reactions (
        workshop_id,
        participant_id,
        emoji,
        is_artificial
    )
    VALUES (
        target_workshop_id,
        target_participant_id,
        target_emoji,
        target_participant_id IS NULL
    )
    RETURNING * INTO created_reaction;

    SELECT count(*)::bigint
    INTO total_reaction_count
    FROM public.workshop_reactions AS workshop_reaction
    WHERE workshop_reaction.workshop_id = target_workshop_id
      AND workshop_reaction.emoji = created_reaction.emoji;

    RETURN QUERY
    SELECT
        created_reaction.id,
        created_reaction.emoji,
        created_reaction.created_at,
        total_reaction_count;
END;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_reaction_counts(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_workshop_reaction(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_reaction_counts(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_workshop_reaction(uuid, uuid, text) TO service_role;

COMMIT;
