-- The administration lists, rewrites and removes short links, not only creates them.
-- `migrations/2026-08-0500-admin-shortener.sql` took every write away from the public and gave the service role
-- nothing but INSERT, so editing and deleting a link were refused before they ever reached a row.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."ShortcodeLink" TO service_role;

-- A short link which was ever visited is referenced by its measured clicks, which used to refuse its deletion.
-- Removing a link removes what was measured on it, because a click of a link which no longer exists says nothing.
ALTER TABLE public."ShortcodeLinkClick" DROP CONSTRAINT IF EXISTS "ShortcodeLinkClick_shortcodeLinkId_fkey";
ALTER TABLE public."ShortcodeLinkClick"
    ADD CONSTRAINT "ShortcodeLinkClick_shortcodeLinkId_fkey"
    FOREIGN KEY ("shortcodeLinkId") REFERENCES public."ShortcodeLink" ("id") ON DELETE CASCADE;

-- The listing is read newest first, which is the one order the administration ever asks for.
CREATE INDEX IF NOT EXISTS "ShortcodeLink_createdAt_idx" ON public."ShortcodeLink" ("createdAt" DESC, "id" DESC);

COMMIT;
