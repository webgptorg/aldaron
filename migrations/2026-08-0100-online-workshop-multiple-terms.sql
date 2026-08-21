-- The public workshop landing page reads published future terms in start order,
-- while legacy participant and confirmation links choose the newest published
-- term. One partial index supports both paths without indexing drafts.

BEGIN;

CREATE INDEX IF NOT EXISTS workshops_published_starts_at_idx
    ON public.workshops (starts_at ASC)
    WHERE is_published;

COMMIT;
