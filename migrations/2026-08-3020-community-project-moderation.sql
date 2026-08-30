-- Moderation lifecycle for community projects.
--
-- Existing cards were intentionally visible before projects gained moderation, so they remain approved. New rows
-- default to pending as a database safeguard; the application then applies the same trusted/moderator policy used by
-- chat messages while it creates a project.

BEGIN;

ALTER TABLE public.community_projects
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

ALTER TABLE public.community_projects
    DROP CONSTRAINT IF EXISTS community_projects_status;
ALTER TABLE public.community_projects
    ADD CONSTRAINT community_projects_status CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.community_projects
    ALTER COLUMN status SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS community_projects_status_top_idx
    ON public.community_projects (status, upvote_count DESC, created_at DESC);

COMMIT;
