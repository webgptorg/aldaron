-- A full AI Supervize Mini term still accepts a registration, but records it
-- separately from confirmed participants so it cannot consume a workshop seat.

BEGIN;

ALTER TABLE public."Contact"
    ADD COLUMN IF NOT EXISTS "isWaitlisted" boolean NOT NULL DEFAULT false;

COMMIT;
