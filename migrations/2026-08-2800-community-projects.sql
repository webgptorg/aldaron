-- Community project sharing.
--
-- A project owns just its public card data and votes. Its discussion deliberately reuses a calm room in the existing
-- workshop infrastructure, so comments, moderation, sessions, and their audit trail stay one implementation. The
-- project author is mapped into that room as its first moderator inside the same transaction which creates the card.

BEGIN;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_room_kind;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_room_kind CHECK (room_kind IN ('workshop', 'community', 'project'));

CREATE TABLE IF NOT EXISTS public.community_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_community_participant_id uuid NOT NULL
        REFERENCES public.workshop_participants(id) ON DELETE RESTRICT,
    discussion_workshop_id uuid NOT NULL UNIQUE
        REFERENCES public.workshops(id) ON DELETE CASCADE,
    url text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    preview_image_url text,
    upvote_count integer NOT NULL DEFAULT 0,
    downvote_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT community_projects_url_length CHECK (char_length(url) BETWEEN 1 AND 2048),
    CONSTRAINT community_projects_url_protocol CHECK (url ~ '^https?://'),
    CONSTRAINT community_projects_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
    CONSTRAINT community_projects_description_length CHECK (char_length(description) <= 2000),
    CONSTRAINT community_projects_preview_image_url_length CHECK (
        preview_image_url IS NULL OR char_length(preview_image_url) BETWEEN 1 AND 2048
    ),
    CONSTRAINT community_projects_upvote_count CHECK (upvote_count >= 0),
    CONSTRAINT community_projects_downvote_count CHECK (downvote_count >= 0)
);

CREATE INDEX IF NOT EXISTS community_projects_top_idx
    ON public.community_projects (upvote_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS community_projects_author_idx
    ON public.community_projects (author_community_participant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.community_project_votes (
    project_id uuid NOT NULL REFERENCES public.community_projects(id) ON DELETE CASCADE,
    community_participant_id uuid NOT NULL REFERENCES public.workshop_participants(id) ON DELETE CASCADE,
    vote smallint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, community_participant_id),
    CONSTRAINT community_project_votes_value CHECK (vote IN (-1, 1))
);

CREATE INDEX IF NOT EXISTS community_project_votes_participant_idx
    ON public.community_project_votes (community_participant_id, project_id);

-- This map means a community identity gets one participant identity in each project discussion. It prevents a
-- project room from becoming a second sign-up system and gives the author a durable moderator identity.
CREATE TABLE IF NOT EXISTS public.community_project_discussion_participants (
    project_id uuid NOT NULL REFERENCES public.community_projects(id) ON DELETE CASCADE,
    community_participant_id uuid NOT NULL REFERENCES public.workshop_participants(id) ON DELETE CASCADE,
    discussion_participant_id uuid NOT NULL REFERENCES public.workshop_participants(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, community_participant_id),
    CONSTRAINT community_project_discussion_participants_discussion_identity UNIQUE (project_id, discussion_participant_id)
);

CREATE INDEX IF NOT EXISTS community_project_discussion_participants_discussion_idx
    ON public.community_project_discussion_participants (discussion_participant_id);

CREATE OR REPLACE FUNCTION public.set_community_project_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_projects_set_updated_at ON public.community_projects;
CREATE TRIGGER community_projects_set_updated_at
    BEFORE UPDATE ON public.community_projects
    FOR EACH ROW EXECUTE FUNCTION public.set_community_project_updated_at();

DROP TRIGGER IF EXISTS community_project_votes_set_updated_at ON public.community_project_votes;
CREATE TRIGGER community_project_votes_set_updated_at
    BEFORE UPDATE ON public.community_project_votes
    FOR EACH ROW EXECUTE FUNCTION public.set_community_project_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_community_project_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS community_participant
        INNER JOIN public.workshops AS community_room
            ON community_room.id = community_participant.workshop_id
        WHERE community_participant.id = NEW.author_community_participant_id
          AND community_room.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_AUTHOR_INVALID';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshops AS discussion_room
        WHERE discussion_room.id = NEW.discussion_workshop_id
          AND discussion_room.room_kind = 'project'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_DISCUSSION_INVALID';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_projects_enforce_identity ON public.community_projects;
CREATE TRIGGER community_projects_enforce_identity
    BEFORE INSERT OR UPDATE OF author_community_participant_id, discussion_workshop_id ON public.community_projects
    FOR EACH ROW EXECUTE FUNCTION public.enforce_community_project_identity();

CREATE OR REPLACE FUNCTION public.enforce_community_project_vote_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS community_participant
        INNER JOIN public.workshops AS community_room
            ON community_room.id = community_participant.workshop_id
        WHERE community_participant.id = NEW.community_participant_id
          AND community_room.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_VOTER_INVALID';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_project_votes_enforce_identity ON public.community_project_votes;
CREATE TRIGGER community_project_votes_enforce_identity
    BEFORE INSERT OR UPDATE OF community_participant_id ON public.community_project_votes
    FOR EACH ROW EXECUTE FUNCTION public.enforce_community_project_vote_identity();

CREATE OR REPLACE FUNCTION public.enforce_community_project_discussion_participant_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    target_discussion_workshop_id uuid;
BEGIN
    SELECT community_project.discussion_workshop_id
    INTO target_discussion_workshop_id
    FROM public.community_projects AS community_project
    WHERE community_project.id = NEW.project_id;

    IF target_discussion_workshop_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_NOT_FOUND';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS community_participant
        INNER JOIN public.workshops AS community_room
            ON community_room.id = community_participant.workshop_id
        WHERE community_participant.id = NEW.community_participant_id
          AND community_room.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_DISCUSSION_MEMBER_INVALID';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS discussion_participant
        WHERE discussion_participant.id = NEW.discussion_participant_id
          AND discussion_participant.workshop_id = target_discussion_workshop_id
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_INVALID';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_project_discussion_participants_enforce_identity
    ON public.community_project_discussion_participants;
CREATE TRIGGER community_project_discussion_participants_enforce_identity
    BEFORE INSERT OR UPDATE OF project_id, community_participant_id, discussion_participant_id
    ON public.community_project_discussion_participants
    FOR EACH ROW EXECUTE FUNCTION public.enforce_community_project_discussion_participant_identity();

CREATE OR REPLACE FUNCTION public.update_community_project_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    target_project_id uuid;
    upvote_difference integer := 0;
    downvote_difference integer := 0;
BEGIN
    IF TG_OP = 'INSERT' THEN
        target_project_id := NEW.project_id;
        upvote_difference := CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END;
        downvote_difference := CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END;
    ELSIF TG_OP = 'DELETE' THEN
        target_project_id := OLD.project_id;
        upvote_difference := CASE WHEN OLD.vote = 1 THEN -1 ELSE 0 END;
        downvote_difference := CASE WHEN OLD.vote = -1 THEN -1 ELSE 0 END;
    ELSE
        target_project_id := NEW.project_id;
        upvote_difference := (CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END) - (CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END);
        downvote_difference := (CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END) - (CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END);
    END IF;

    UPDATE public.community_projects AS community_project
    SET
        upvote_count = GREATEST(0, community_project.upvote_count + upvote_difference),
        downvote_count = GREATEST(0, community_project.downvote_count + downvote_difference)
    WHERE community_project.id = target_project_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_project_votes_update_counts ON public.community_project_votes;
CREATE TRIGGER community_project_votes_update_counts
    AFTER INSERT OR UPDATE OF vote OR DELETE ON public.community_project_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_community_project_vote_counts();

CREATE OR REPLACE FUNCTION public.create_community_project(
    target_community_participant_id uuid,
    target_url text,
    target_title text,
    target_description text,
    target_preview_image_url text
)
RETURNS TABLE (
    project_id uuid,
    discussion_workshop_id uuid,
    discussion_workshop_slug text
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    author_fullname text;
    author_email text;
    created_project_id uuid;
    created_discussion_workshop_id uuid;
    created_discussion_workshop_slug text;
    created_discussion_participant_id uuid;
BEGIN
    IF char_length(btrim(COALESCE(target_url, ''))) NOT BETWEEN 1 AND 2048
       OR btrim(target_url) !~ '^https?://' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_PROJECT_URL_INVALID';
    END IF;

    IF char_length(btrim(COALESCE(target_title, ''))) NOT BETWEEN 1 AND 200 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_PROJECT_TITLE_INVALID';
    END IF;

    IF char_length(COALESCE(target_description, '')) > 2000 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_PROJECT_DESCRIPTION_INVALID';
    END IF;

    IF target_preview_image_url IS NOT NULL
       AND char_length(target_preview_image_url) NOT BETWEEN 1 AND 2048 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_PROJECT_PREVIEW_IMAGE_INVALID';
    END IF;

    SELECT community_participant.fullname, community_participant.email
    INTO author_fullname, author_email
    FROM public.workshop_participants AS community_participant
    INNER JOIN public.workshops AS community_room
        ON community_room.id = community_participant.workshop_id
    WHERE community_participant.id = target_community_participant_id
      AND community_room.room_kind = 'community';

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_AUTHOR_INVALID';
    END IF;

    created_discussion_workshop_slug := 'community-project-' || replace(gen_random_uuid()::text, '-', '');

    INSERT INTO public.workshops (
        slug,
        room_kind,
        title,
        description,
        starts_at,
        ends_at,
        is_published
    )
    VALUES (
        created_discussion_workshop_slug,
        'project',
        btrim(target_title),
        COALESCE(target_description, ''),
        now(),
        NULL,
        true
    )
    RETURNING id INTO created_discussion_workshop_id;

    INSERT INTO public.community_projects (
        author_community_participant_id,
        discussion_workshop_id,
        url,
        title,
        description,
        preview_image_url
    )
    VALUES (
        target_community_participant_id,
        created_discussion_workshop_id,
        btrim(target_url),
        btrim(target_title),
        COALESCE(target_description, ''),
        target_preview_image_url
    )
    RETURNING id INTO created_project_id;

    INSERT INTO public.workshop_participants (
        workshop_id,
        fullname,
        email,
        session_token_hash,
        is_moderator
    )
    VALUES (
        created_discussion_workshop_id,
        author_fullname,
        author_email,
        encode(gen_random_bytes(32), 'hex'),
        true
    )
    RETURNING id INTO created_discussion_participant_id;

    INSERT INTO public.community_project_discussion_participants (
        project_id,
        community_participant_id,
        discussion_participant_id
    )
    VALUES (
        created_project_id,
        target_community_participant_id,
        created_discussion_participant_id
    );

    RETURN QUERY SELECT created_project_id, created_discussion_workshop_id, created_discussion_workshop_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.connect_community_project_discussion(
    target_project_id uuid,
    target_community_participant_id uuid
)
RETURNS TABLE (
    discussion_workshop_id uuid,
    discussion_workshop_slug text,
    discussion_participant_id uuid
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    target_discussion_workshop_id uuid;
    target_discussion_workshop_slug text;
    project_author_community_participant_id uuid;
    source_fullname text;
    source_email text;
    existing_discussion_participant_id uuid;
    is_project_author boolean;
BEGIN
    SELECT
        community_project.discussion_workshop_id,
        discussion_room.slug,
        community_project.author_community_participant_id
    INTO
        target_discussion_workshop_id,
        target_discussion_workshop_slug,
        project_author_community_participant_id
    FROM public.community_projects AS community_project
    INNER JOIN public.workshops AS discussion_room
        ON discussion_room.id = community_project.discussion_workshop_id
    WHERE community_project.id = target_project_id
      AND discussion_room.room_kind = 'project'
      AND discussion_room.is_published;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'COMMUNITY_PROJECT_NOT_FOUND';
    END IF;

    SELECT community_participant.fullname, community_participant.email
    INTO source_fullname, source_email
    FROM public.workshop_participants AS community_participant
    INNER JOIN public.workshops AS community_room
        ON community_room.id = community_participant.workshop_id
    WHERE community_participant.id = target_community_participant_id
      AND community_room.room_kind = 'community';

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_DISCUSSION_MEMBER_INVALID';
    END IF;

    PERFORM pg_advisory_xact_lock(
        hashtextextended(
            'community-project-discussion:' || target_project_id::text || ':' || target_community_participant_id::text,
            0
        )
    );

    SELECT mapping.discussion_participant_id
    INTO existing_discussion_participant_id
    FROM public.community_project_discussion_participants AS mapping
    WHERE mapping.project_id = target_project_id
      AND mapping.community_participant_id = target_community_participant_id;

    is_project_author := project_author_community_participant_id = target_community_participant_id;

    IF FOUND THEN
        UPDATE public.workshop_participants AS discussion_participant
        SET
            fullname = source_fullname,
            email = source_email,
            is_moderator = discussion_participant.is_moderator OR is_project_author
        WHERE discussion_participant.id = existing_discussion_participant_id
          AND discussion_participant.workshop_id = target_discussion_workshop_id;
    ELSE
        INSERT INTO public.workshop_participants (
            workshop_id,
            fullname,
            email,
            session_token_hash,
            is_moderator
        )
        VALUES (
            target_discussion_workshop_id,
            source_fullname,
            source_email,
            encode(gen_random_bytes(32), 'hex'),
            is_project_author
        )
        RETURNING id INTO existing_discussion_participant_id;

        INSERT INTO public.community_project_discussion_participants (
            project_id,
            community_participant_id,
            discussion_participant_id
        )
        VALUES (
            target_project_id,
            target_community_participant_id,
            existing_discussion_participant_id
        );
    END IF;

    RETURN QUERY SELECT
        target_discussion_workshop_id,
        target_discussion_workshop_slug,
        existing_discussion_participant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_community_project_vote(
    target_project_id uuid,
    target_community_participant_id uuid,
    target_vote smallint
)
RETURNS TABLE (
    vote smallint,
    upvote_count integer,
    downvote_count integer
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    existing_vote smallint;
    selected_vote smallint;
BEGIN
    IF target_vote NOT IN (-1, 1) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_PROJECT_VOTE_INVALID';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS community_participant
        INNER JOIN public.workshops AS community_room
            ON community_room.id = community_participant.workshop_id
        WHERE community_participant.id = target_community_participant_id
          AND community_room.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'COMMUNITY_PROJECT_VOTER_INVALID';
    END IF;

    PERFORM pg_advisory_xact_lock(
        hashtextextended(
            'community-project-vote:' || target_project_id::text || ':' || target_community_participant_id::text,
            0
        )
    );

    SELECT community_project_vote.vote
    INTO existing_vote
    FROM public.community_project_votes AS community_project_vote
    WHERE community_project_vote.project_id = target_project_id
      AND community_project_vote.community_participant_id = target_community_participant_id;

    IF NOT FOUND THEN
        IF NOT EXISTS (SELECT 1 FROM public.community_projects WHERE id = target_project_id) THEN
            RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'COMMUNITY_PROJECT_NOT_FOUND';
        END IF;

        INSERT INTO public.community_project_votes (project_id, community_participant_id, vote)
        VALUES (target_project_id, target_community_participant_id, target_vote);
        selected_vote := target_vote;
    ELSIF existing_vote = target_vote THEN
        DELETE FROM public.community_project_votes
        WHERE project_id = target_project_id
          AND community_participant_id = target_community_participant_id;
        selected_vote := NULL;
    ELSE
        UPDATE public.community_project_votes
        SET vote = target_vote
        WHERE project_id = target_project_id
          AND community_participant_id = target_community_participant_id;
        selected_vote := target_vote;
    END IF;

    RETURN QUERY
    SELECT selected_vote, community_project.upvote_count, community_project.downvote_count
    FROM public.community_projects AS community_project
    WHERE community_project.id = target_project_id;
END;
$$;

DO $$
DECLARE
    community_project_table_name text;
BEGIN
    FOREACH community_project_table_name IN ARRAY ARRAY[
        'community_projects',
        'community_project_votes',
        'community_project_discussion_participants'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', community_project_table_name);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', community_project_table_name);
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', community_project_table_name);
        EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', community_project_table_name);
    END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.set_community_project_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_community_project_identity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_community_project_vote_identity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_community_project_discussion_participant_identity()
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_community_project_vote_counts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_community_project(uuid, text, text, text, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.connect_community_project_discussion(uuid, uuid)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_community_project_vote(uuid, uuid, smallint)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_community_project_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_community_project_identity() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_community_project_vote_identity() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_community_project_discussion_participant_identity() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_community_project_vote_counts() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_community_project(uuid, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.connect_community_project_discussion(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_community_project_vote(uuid, uuid, smallint) TO service_role;

COMMIT;
