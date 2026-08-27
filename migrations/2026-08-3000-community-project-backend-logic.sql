-- Community-project mutations now live in the Node.js backend.
--
-- The original migration remains immutable for databases which recorded it. This forward migration removes every
-- project-specific trigger and stored procedure, leaving the database responsible only for durable rows, foreign keys,
-- uniqueness, and simple column constraints. The backend explicitly supplies project IDs and update timestamps.

BEGIN;

DROP TRIGGER IF EXISTS community_projects_set_updated_at ON public.community_projects;
DROP TRIGGER IF EXISTS community_project_votes_set_updated_at ON public.community_project_votes;
DROP TRIGGER IF EXISTS community_projects_enforce_identity ON public.community_projects;
DROP TRIGGER IF EXISTS community_project_votes_enforce_identity ON public.community_project_votes;
DROP TRIGGER IF EXISTS community_project_discussion_participants_enforce_identity
    ON public.community_project_discussion_participants;
DROP TRIGGER IF EXISTS community_project_votes_update_counts ON public.community_project_votes;

DROP FUNCTION IF EXISTS public.set_community_project_updated_at();
DROP FUNCTION IF EXISTS public.enforce_community_project_identity();
DROP FUNCTION IF EXISTS public.enforce_community_project_vote_identity();
DROP FUNCTION IF EXISTS public.enforce_community_project_discussion_participant_identity();
DROP FUNCTION IF EXISTS public.update_community_project_vote_counts();
DROP FUNCTION IF EXISTS public.create_community_project(uuid, text, text, text, text);
DROP FUNCTION IF EXISTS public.connect_community_project_discussion(uuid, uuid);
DROP FUNCTION IF EXISTS public.set_community_project_vote(uuid, uuid, smallint);

-- Project IDs are created by the backend with Node's cryptographic UUID generator, so this table no longer needs a
-- database extension-backed random default. Existing rows are unaffected.
ALTER TABLE public.community_projects
    ALTER COLUMN id DROP DEFAULT;

COMMIT;
