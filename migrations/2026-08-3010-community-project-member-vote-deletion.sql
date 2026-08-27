-- A departed community member's project votes must be reconciled by the backend before their participant row can go.
--
-- The count trigger was intentionally removed in the preceding migration. Restricting this foreign key prevents an
-- accidental cascading delete from leaving the denormalized project totals stale; the backend now removes the votes,
-- persists their adjusted totals, and deletes the member in one transaction.

BEGIN;

ALTER TABLE public.community_project_votes
    DROP CONSTRAINT IF EXISTS community_project_votes_community_participant_id_fkey;
ALTER TABLE public.community_project_votes
    ADD CONSTRAINT community_project_votes_community_participant_id_fkey
        FOREIGN KEY (community_participant_id)
        REFERENCES public.workshop_participants(id) ON DELETE RESTRICT;

COMMIT;
