-- An administrator-controlled audience offset for the live watching badge.
-- It is deliberately separate from participants and attendance samples: it changes
-- only the public live count and never pretends that an artificial viewer was a
-- real participant.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS artificial_watching_participant_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_artificial_watching_participant_count;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_artificial_watching_participant_count CHECK (
        artificial_watching_participant_count >= 0
    );

COMMIT;
