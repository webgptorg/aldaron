-- Changing a vote from up to down (or back) must move both counters atomically.
BEGIN;
CREATE OR REPLACE FUNCTION public.update_community_project_vote_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_projects SET upvote_count = upvote_count + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END, downvote_count = downvote_count + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END, updated_at = now() WHERE id = NEW.project_id;
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' THEN
        UPDATE public.community_projects SET upvote_count = upvote_count + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END, downvote_count = downvote_count + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END, updated_at = now() WHERE id = NEW.project_id;
        RETURN NEW;
    END IF;
    UPDATE public.community_projects SET upvote_count = GREATEST(0, upvote_count - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END), downvote_count = GREATEST(0, downvote_count - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END), updated_at = now() WHERE id = OLD.project_id;
    RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS community_project_votes_update_count ON public.community_project_votes;
CREATE TRIGGER community_project_votes_update_count AFTER INSERT OR UPDATE OR DELETE ON public.community_project_votes FOR EACH ROW EXECUTE FUNCTION public.update_community_project_vote_count();
COMMIT;
