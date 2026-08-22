-- Activity totals for the contacts administration across a selected set of workshop occurrences.
--
-- A contact can attend any number of workshops, so loading one aggregate for every occurrence would make the
-- contacts dashboard slower as the history grows. This multi-workshop aggregate is the source of truth; the existing
-- single-workshop aggregate below delegates to it so the workshop administration and contact exports cannot disagree.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_workshop_participant_activity_totals_for_workshops(target_workshop_ids uuid[])
RETURNS TABLE (
    workshop_id uuid,
    participant_id uuid,
    comment_count bigint,
    reaction_count bigint,
    link_click_count bigint,
    upvote_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    WITH comment_totals AS (
        SELECT
            workshop_comment.workshop_id,
            workshop_comment.participant_id,
            count(*)::bigint AS comment_count
        FROM public.workshop_comments AS workshop_comment
        WHERE workshop_comment.participant_id IS NOT NULL
          AND workshop_comment.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_comment.workshop_id, workshop_comment.participant_id
    ), reaction_totals AS (
        SELECT
            workshop_reaction.workshop_id,
            workshop_reaction.participant_id,
            count(*)::bigint AS reaction_count
        FROM public.workshop_reactions AS workshop_reaction
        WHERE workshop_reaction.participant_id IS NOT NULL
          AND workshop_reaction.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_reaction.workshop_id, workshop_reaction.participant_id
    ), link_click_totals AS (
        SELECT
            workshop_link_click.workshop_id,
            workshop_link_click.participant_id,
            count(*)::bigint AS link_click_count
        FROM public.workshop_content_link_clicks AS workshop_link_click
        WHERE workshop_link_click.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_link_click.workshop_id, workshop_link_click.participant_id
    ), upvote_totals AS (
        SELECT
            workshop_upvote.workshop_id,
            workshop_upvote.participant_id,
            count(*)::bigint AS upvote_count
        FROM public.workshop_comment_upvotes AS workshop_upvote
        WHERE workshop_upvote.workshop_id = ANY(target_workshop_ids)
        GROUP BY workshop_upvote.workshop_id, workshop_upvote.participant_id
    )
    SELECT
        workshop_participant.workshop_id,
        workshop_participant.id,
        COALESCE(comment_totals.comment_count, 0)::bigint,
        COALESCE(reaction_totals.reaction_count, 0)::bigint,
        COALESCE(link_click_totals.link_click_count, 0)::bigint,
        COALESCE(upvote_totals.upvote_count, 0)::bigint
    FROM public.workshop_participants AS workshop_participant
    LEFT JOIN comment_totals
        ON comment_totals.workshop_id = workshop_participant.workshop_id
       AND comment_totals.participant_id = workshop_participant.id
    LEFT JOIN reaction_totals
        ON reaction_totals.workshop_id = workshop_participant.workshop_id
       AND reaction_totals.participant_id = workshop_participant.id
    LEFT JOIN link_click_totals
        ON link_click_totals.workshop_id = workshop_participant.workshop_id
       AND link_click_totals.participant_id = workshop_participant.id
    LEFT JOIN upvote_totals
        ON upvote_totals.workshop_id = workshop_participant.workshop_id
       AND upvote_totals.participant_id = workshop_participant.id
    WHERE workshop_participant.workshop_id = ANY(target_workshop_ids);
$$;

CREATE OR REPLACE FUNCTION public.get_workshop_participant_activity_totals(target_workshop_id uuid)
RETURNS TABLE (
    participant_id uuid,
    comment_count bigint,
    reaction_count bigint,
    link_click_count bigint,
    upvote_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        activity_totals.participant_id,
        activity_totals.comment_count,
        activity_totals.reaction_count,
        activity_totals.link_click_count,
        activity_totals.upvote_count
    FROM public.get_workshop_participant_activity_totals_for_workshops(ARRAY[target_workshop_id]) AS activity_totals;
$$;

REVOKE ALL ON FUNCTION public.get_workshop_participant_activity_totals_for_workshops(uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_workshop_participant_activity_totals(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_activity_totals_for_workshops(uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_activity_totals(uuid) TO service_role;

COMMIT;
