-- The App table belongs to the old Promptbook Studio system and is no longer part of the shortener.
-- Keep the historical appId values on existing links, but remove the obsolete relational dependency.

BEGIN;

ALTER TABLE public."ShortcodeLink"
    DROP CONSTRAINT IF EXISTS "ShortcodeLink_appId_fkey";

COMMIT;
