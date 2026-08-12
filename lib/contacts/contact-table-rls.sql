-- Row level security of the `Contact` table, which holds every gathered lead
--
-- Note: Run this once in the SQL editor of the Supabase project. The steps around it, above all the service role key
--       which has to be set before this runs, are written down in `AGENT_MESSAGE.md`.
--
-- Why: The table holds names, e-mail addresses, phone numbers, notes and ip addresses of everybody who ever left their
--      contact on the site. The anonymous key of the database is public, it is part of every single page, so as long as
--      the table is reachable with it, anybody can read, change and delete every lead. Row level security with no policy
--      at all closes the table for the anonymous and for the authenticated key, while the service role key, which never
--      leaves our server, keeps full access to it. Every contact is therefore written and read only through
--      `/api/waitlist` and `/api/contacts`.

-- 1. Close the table. A table with row level security and no policy answers "no rows" to everybody but the service
--    role, which is exactly what is wanted here.
ALTER TABLE public."Contact" ENABLE ROW LEVEL SECURITY;

-- 2. Take away every policy an earlier setup may have left behind, so that the result does not depend on what the
--    project happened to have before. A policy is what opens a closed table, so none of them may stay.
DO $$
DECLARE
    leftoverPolicyName text;
BEGIN
    FOR leftoverPolicyName IN
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Contact'
    LOOP
        EXECUTE format('DROP POLICY %I ON public."Contact"', leftoverPolicyName);
    END LOOP;
END $$;

-- 3. Take the table away from the public keys altogether. Row level security alone would already be enough, this is the
--    second lock: even if somebody ever adds a policy by mistake, without this right the table still cannot be touched.
REVOKE ALL ON TABLE public."Contact" FROM anon, authenticated;

-- 4. Make sure the server itself keeps its full access.
GRANT ALL ON TABLE public."Contact" TO service_role;

-- How to check that it worked, both queries are only read:
--
--   SELECT relrowsecurity FROM pg_class WHERE oid = 'public."Contact"'::regclass;
--   -- expected: t
--
--   SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Contact';
--   -- expected: no rows
