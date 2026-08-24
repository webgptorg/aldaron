-- The migration runner records the immutable name and SHA-256 checksum of every migration in this table.
-- It is intentionally the first migration, before the dated migrations which it will track.

BEGIN;

CREATE TABLE IF NOT EXISTS public."Migration" (
    name text PRIMARY KEY,
    checksum text NOT NULL
);

COMMIT;
