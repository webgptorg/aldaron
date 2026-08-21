-- The size of the audience of every workshop, for the occurrence cards of the administration.
--
-- The administration lists all terms of one room kind at once, so every card would otherwise
-- cost a count query of its own. One aggregate keeps the list a single database round trip
-- however many terms have already taken place, and a term nobody joined is still listed,
-- because the workshops lead the join.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_workshop_participant_counts(target_room_kind text)
RETURNS TABLE (
    workshop_id uuid,
    participant_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        workshop.id,
        count(workshop_participant.id)::bigint
    FROM public.workshops AS workshop
    LEFT JOIN public.workshop_participants AS workshop_participant
        ON workshop_participant.workshop_id = workshop.id
    WHERE workshop.room_kind = target_room_kind
    GROUP BY workshop.id;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_participant_counts(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_counts(text) TO service_role;

COMMIT;
