-- Projects and creations shared by members of the permanent community.
--
-- This is a room feature, not a second community application: a project is attributable to the same authenticated
-- participant as a chat message, subject to the same trusted-member moderation decision, and is kept inside its one
-- community by both a composite foreign key and a database trigger.

BEGIN;

CREATE TABLE IF NOT EXISTS public.workshop_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL,
    author_name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    url text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_projects_workshop_identity UNIQUE (id, workshop_id),
    CONSTRAINT workshop_projects_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_projects_author_name_length CHECK (char_length(author_name) BETWEEN 1 AND 200),
    CONSTRAINT workshop_projects_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
    CONSTRAINT workshop_projects_description_length CHECK (char_length(description) <= 2000),
    CONSTRAINT workshop_projects_url_http CHECK (
        url IS NULL
        OR (
            char_length(url) BETWEEN 1 AND 2000
            AND url ~* '^https?://[^[:space:]]+$'
        )
    ),
    CONSTRAINT workshop_projects_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS workshop_projects_visible_idx
    ON public.workshop_projects (workshop_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_projects_participant_rate_idx
    ON public.workshop_projects (participant_id, created_at DESC);

-- A project gallery belongs only to a room which explicitly offers it. The HTTP routes ask the same shared capability
-- before writing, while this guard keeps an accidental future service-role query from putting project posts in a
-- one-off workshop.
CREATE OR REPLACE FUNCTION public.enforce_community_workshop_project()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshops AS workshop
        WHERE workshop.id = NEW.workshop_id
          AND workshop.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_PROJECT_NOT_COMMUNITY';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_projects_enforce_community ON public.workshop_projects;
CREATE TRIGGER workshop_projects_enforce_community
    BEFORE INSERT OR UPDATE OF workshop_id ON public.workshop_projects
    FOR EACH ROW EXECUTE FUNCTION public.enforce_community_workshop_project();

-- A project is a deliberate, lasting post rather than a keystroke in the chat. The short per-member interval keeps a
-- forged burst from filling the gallery, and the advisory lock makes two simultaneous browser requests answer as one.
CREATE OR REPLACE FUNCTION public.enforce_workshop_project_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended('workshop-project:' || NEW.participant_id::text, 0));

    IF EXISTS (
        SELECT 1
        FROM public.workshop_projects AS recent_project
        WHERE recent_project.participant_id = NEW.participant_id
          AND recent_project.created_at >= clock_timestamp() - interval '30 seconds'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_PROJECT_RATE_LIMITED';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_projects_enforce_rate_limit ON public.workshop_projects;
CREATE TRIGGER workshop_projects_enforce_rate_limit
    BEFORE INSERT ON public.workshop_projects
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_project_rate_limit();

DROP TRIGGER IF EXISTS workshop_projects_set_updated_at ON public.workshop_projects;
CREATE TRIGGER workshop_projects_set_updated_at
    BEFORE UPDATE ON public.workshop_projects
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

ALTER TABLE public.workshop_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_projects FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.workshop_projects FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_projects TO service_role;

REVOKE ALL ON FUNCTION public.enforce_community_workshop_project() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_workshop_project_rate_limit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_community_workshop_project() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_project_rate_limit() TO service_role;

COMMIT;
