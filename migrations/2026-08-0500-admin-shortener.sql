-- Public visitors may resolve an existing short link, but only the admin API may create or alter one.
-- The API uses the Supabase service role after it validates the shared admin token.

BEGIN;

REVOKE INSERT, UPDATE, DELETE ON TABLE public."ShortcodeLink" FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public."ShortcodeLink" TO service_role;

COMMIT;
