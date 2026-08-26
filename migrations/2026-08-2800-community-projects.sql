-- Community projects use the existing workshop room for their discussion, while
-- this table owns the public project card and its ranking.
BEGIN;

CREATE TABLE IF NOT EXISTS public.community_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    discussion_workshop_id uuid NOT NULL UNIQUE REFERENCES public.workshops(id) ON DELETE CASCADE,
    author_participant_id uuid NOT NULL,
    url text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    og_image_url text,
    upvote_count integer NOT NULL DEFAULT 0,
    downvote_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT community_projects_url_length CHECK (char_length(url) BETWEEN 8 AND 2048),
    CONSTRAINT community_projects_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
    CONSTRAINT community_projects_description_length CHECK (char_length(description) <= 2000),
    CONSTRAINT community_projects_vote_counts CHECK (upvote_count >= 0 AND downvote_count >= 0),
    CONSTRAINT community_projects_author_same_community FOREIGN KEY (author_participant_id, community_workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.community_project_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.community_projects(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL,
    vote smallint NOT NULL CHECK (vote IN (-1, 1)),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (project_id, participant_id)
);

CREATE INDEX IF NOT EXISTS community_projects_ranking_idx
    ON public.community_projects (upvote_count DESC, downvote_count ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS community_project_votes_participant_idx
    ON public.community_project_votes (participant_id, project_id);

CREATE OR REPLACE FUNCTION public.update_community_project_vote_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_projects
        SET upvote_count = upvote_count + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END,
            downvote_count = downvote_count + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END,
            updated_at = now() WHERE id = NEW.project_id;
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' THEN
        UPDATE public.community_projects
        SET upvote_count = upvote_count + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END,
            downvote_count = downvote_count + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END,
            updated_at = now() WHERE id = NEW.project_id;
        RETURN NEW;
    END IF;
    UPDATE public.community_projects
    SET upvote_count = GREATEST(0, upvote_count - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END),
        downvote_count = GREATEST(0, downvote_count - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END),
        updated_at = now() WHERE id = OLD.project_id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS community_project_votes_update_count ON public.community_project_votes;
CREATE TRIGGER community_project_votes_update_count
AFTER INSERT OR DELETE ON public.community_project_votes
FOR EACH ROW EXECUTE FUNCTION public.update_community_project_vote_count();

REVOKE ALL ON FUNCTION public.update_community_project_vote_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_community_project_vote_count() TO service_role;
COMMIT;
