-- Reusable live-workshop data model.
--
-- All personal and moderation data is reachable only through the server-side
-- service role. Realtime uses a private, receive-only Broadcast channel and
-- carries invalidation events, never participant e-mail addresses or session
-- credentials.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.workshops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    starts_at timestamptz NOT NULL,
    ends_at timestamptz,
    youtube_video_id text,
    is_published boolean NOT NULL DEFAULT false,
    allowed_reactions text[] NOT NULL DEFAULT ARRAY['👍', '❤️', '👏', '🔥', '💡', '😂']::text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshops_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT workshops_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
    CONSTRAINT workshops_description_length CHECK (char_length(description) <= 2000),
    CONSTRAINT workshops_time_order CHECK (ends_at IS NULL OR ends_at > starts_at),
    CONSTRAINT workshops_youtube_video_id_format CHECK (
        youtube_video_id IS NULL OR youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'
    ),
    CONSTRAINT workshops_reactions_count CHECK (cardinality(allowed_reactions) BETWEEN 1 AND 12)
);

CREATE TABLE IF NOT EXISTS public.workshop_content_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT '',
    body_markdown text NOT NULL,
    unlock_at timestamptz NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_content_blocks_title_length CHECK (char_length(title) <= 200),
    CONSTRAINT workshop_content_blocks_body_length CHECK (char_length(body_markdown) BETWEEN 1 AND 100000)
);

CREATE TABLE IF NOT EXISTS public.workshop_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    fullname text NOT NULL,
    email text NOT NULL,
    session_token_hash text NOT NULL UNIQUE,
    connected_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    ip_address inet,
    user_agent text,
    CONSTRAINT workshop_participants_workshop_identity UNIQUE (id, workshop_id),
    CONSTRAINT workshop_participants_fullname_length CHECK (char_length(fullname) BETWEEN 1 AND 200),
    CONSTRAINT workshop_participants_email_length CHECK (char_length(email) BETWEEN 3 AND 320),
    CONSTRAINT workshop_participants_session_hash_format CHECK (session_token_hash ~ '^[a-f0-9]{64}$'),
    CONSTRAINT workshop_participants_user_agent_length CHECK (user_agent IS NULL OR char_length(user_agent) <= 2000)
);

CREATE TABLE IF NOT EXISTS public.workshop_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL,
    author_name text NOT NULL,
    body text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    upvote_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    moderated_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_comments_workshop_identity UNIQUE (id, workshop_id),
    CONSTRAINT workshop_comments_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_comments_author_name_length CHECK (char_length(author_name) BETWEEN 1 AND 200),
    CONSTRAINT workshop_comments_body_length CHECK (char_length(body) BETWEEN 1 AND 2000),
    CONSTRAINT workshop_comments_status CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT workshop_comments_upvote_count CHECK (upvote_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.workshop_comment_upvotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    comment_id uuid NOT NULL,
    participant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_comment_upvotes_one_per_participant UNIQUE (comment_id, participant_id),
    CONSTRAINT workshop_comment_upvotes_comment_fk FOREIGN KEY (comment_id, workshop_id)
        REFERENCES public.workshop_comments(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_comment_upvotes_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.workshop_reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL,
    emoji text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workshop_reactions_participant_fk FOREIGN KEY (participant_id, workshop_id)
        REFERENCES public.workshop_participants(id, workshop_id) ON DELETE CASCADE,
    CONSTRAINT workshop_reactions_emoji_length CHECK (char_length(emoji) BETWEEN 1 AND 16)
);

CREATE INDEX IF NOT EXISTS workshop_content_blocks_visible_idx
    ON public.workshop_content_blocks (workshop_id, is_published, unlock_at, sort_order);
CREATE INDEX IF NOT EXISTS workshop_participants_connected_idx
    ON public.workshop_participants (workshop_id, connected_at DESC);
CREATE INDEX IF NOT EXISTS workshop_comments_participant_rate_idx
    ON public.workshop_comments (participant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_comments_recent_idx
    ON public.workshop_comments (workshop_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_comments_upvotes_idx
    ON public.workshop_comments (workshop_id, status, upvote_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_comment_upvotes_participant_idx
    ON public.workshop_comment_upvotes (participant_id, comment_id);
CREATE INDEX IF NOT EXISTS workshop_reactions_recent_idx
    ON public.workshop_reactions (workshop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workshop_reactions_participant_rate_idx
    ON public.workshop_reactions (participant_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_workshop_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshops_set_updated_at ON public.workshops;
CREATE TRIGGER workshops_set_updated_at
    BEFORE UPDATE ON public.workshops
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

DROP TRIGGER IF EXISTS workshop_content_blocks_set_updated_at ON public.workshop_content_blocks;
CREATE TRIGGER workshop_content_blocks_set_updated_at
    BEFORE UPDATE ON public.workshop_content_blocks
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

DROP TRIGGER IF EXISTS workshop_comments_set_updated_at ON public.workshop_comments;
CREATE TRIGGER workshop_comments_set_updated_at
    BEFORE UPDATE ON public.workshop_comments
    FOR EACH ROW EXECUTE FUNCTION public.set_workshop_updated_at();

-- Serialize actions only per participant. This closes the race between two
-- concurrent server requests without turning normal activity by different
-- participants into a global bottleneck.
CREATE OR REPLACE FUNCTION public.enforce_workshop_comment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended('workshop-comment:' || NEW.participant_id::text, 0));

    IF EXISTS (
        SELECT 1
        FROM public.workshop_comments AS recent_comment
        WHERE recent_comment.participant_id = NEW.participant_id
          AND recent_comment.created_at >= clock_timestamp() - interval '3 seconds'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_COMMENT_RATE_LIMITED';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_comments_enforce_rate_limit ON public.workshop_comments;
CREATE TRIGGER workshop_comments_enforce_rate_limit
    BEFORE INSERT ON public.workshop_comments
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_comment_rate_limit();

CREATE OR REPLACE FUNCTION public.enforce_workshop_reaction_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    recent_reaction_count integer;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended('workshop-reaction:' || NEW.participant_id::text, 0));

    SELECT count(*)
    INTO recent_reaction_count
    FROM public.workshop_reactions AS recent_reaction
    WHERE recent_reaction.participant_id = NEW.participant_id
      AND recent_reaction.created_at >= clock_timestamp() - interval '2 seconds';

    IF recent_reaction_count >= 6 THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_REACTION_RATE_LIMITED';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workshop_reactions_enforce_rate_limit ON public.workshop_reactions;
CREATE TRIGGER workshop_reactions_enforce_rate_limit
    BEFORE INSERT ON public.workshop_reactions
    FOR EACH ROW EXECUTE FUNCTION public.enforce_workshop_reaction_rate_limit();

CREATE OR REPLACE FUNCTION public.update_workshop_comment_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.workshop_comments
        SET upvote_count = upvote_count + 1
        WHERE id = NEW.comment_id AND workshop_id = NEW.workshop_id;
        RETURN NEW;
    END IF;

    UPDATE public.workshop_comments
    SET upvote_count = GREATEST(0, upvote_count - 1)
    WHERE id = OLD.comment_id AND workshop_id = OLD.workshop_id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS workshop_comment_upvotes_update_count ON public.workshop_comment_upvotes;
CREATE TRIGGER workshop_comment_upvotes_update_count
    AFTER INSERT OR DELETE ON public.workshop_comment_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.update_workshop_comment_upvote_count();

REVOKE ALL ON FUNCTION public.set_workshop_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_workshop_comment_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_workshop_reaction_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_workshop_comment_upvote_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_workshop_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_comment_rate_limit() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_workshop_reaction_rate_limit() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_workshop_comment_upvote_count() TO service_role;

-- RLS is the primary boundary: browsers cannot read identities, pending comments,
-- moderation state, or write activity directly. The service role bypasses RLS.
DO $$
DECLARE
    workshop_table_name text;
BEGIN
    FOREACH workshop_table_name IN ARRAY ARRAY[
        'workshops',
        'workshop_content_blocks',
        'workshop_participants',
        'workshop_comments',
        'workshop_comment_upvotes',
        'workshop_reactions'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', workshop_table_name);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', workshop_table_name);
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', workshop_table_name);
        EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', workshop_table_name);
    END LOOP;
END;
$$;

-- Participants receive only server-generated private Broadcast messages. There
-- is deliberately no INSERT policy, so the anonymous browser key cannot forge
-- chat, vote, reaction, or content events.
DROP POLICY IF EXISTS workshop_broadcasts_are_receive_only ON realtime.messages;
CREATE POLICY workshop_broadcasts_are_receive_only
    ON realtime.messages
    FOR SELECT
    TO anon, authenticated
    USING (
        extension = 'broadcast'
        AND (SELECT realtime.topic()) ~ '^workshop:[a-z0-9]+(?:-[a-z0-9]+)*$'
    );

INSERT INTO public.workshops (
    id,
    slug,
    title,
    description,
    starts_at,
    ends_at,
    youtube_video_id,
    is_published
)
VALUES (
    '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    'online-workshop-2026-08-20',
    'Produkční kód s AI agenty',
    'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    '2026-08-20T19:00:00+02:00',
    '2026-08-20T20:30:00+02:00',
    NULL,
    true
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
