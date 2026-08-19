-- Index behind the live count of the people watching a workshop.
--
-- Every state reload and every presence heartbeat counts the participants seen
-- within the watching window, so that count has to be answered from an index
-- instead of a scan over all participants of the workshop.

BEGIN;

CREATE INDEX IF NOT EXISTS workshop_participants_watching_idx
    ON public.workshop_participants (workshop_id, last_seen_at DESC);

COMMIT;
