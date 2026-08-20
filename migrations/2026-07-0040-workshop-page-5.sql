-- The panels of a participant room which an admin switched off.
--
-- The workshop remembers the panels which are gone instead of the ones which are
-- there, so a panel added later is offered by every workshop without a backfill
-- and without a migration of its own. The known keys therefore live in the
-- application registry, and the database only guards their shape and their
-- number, which keeps a new panel a one-line change.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS disabled_panels text[] NOT NULL DEFAULT ARRAY[]::text[];

-- A panel key is a slug just like the one of a workshop. Joining the array proves
-- the shape of every single element without a subquery, which a check constraint
-- cannot carry, and rejects an empty one. A NULL element is asked for separately,
-- because joining the array leaves it out instead of failing on it.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_disabled_panels_keys;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_disabled_panels_keys CHECK (
        cardinality(disabled_panels) <= 50
        AND array_position(disabled_panels, NULL::text) IS NULL
        AND (
            cardinality(disabled_panels) = 0
            OR array_to_string(disabled_panels, ',') ~ '^[a-z0-9]+(?:-[a-z0-9]+)*(?:,[a-z0-9]+(?:-[a-z0-9]+)*)*$'
        )
    );

COMMIT;
