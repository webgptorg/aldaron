-- Moderator and artificial-chat links are public short links, just like
-- material links. A regular participant's raw URL deliberately has no row in
-- this table because the chat renders it as inert text.
--
-- The shortener records navigation itself, so a copied chat link remains
-- truthfully tracked even when somebody opens it outside the workshop room.

BEGIN;

CREATE TABLE IF NOT EXISTS public.workshop_comment_shortcode_links (
    comment_id uuid NOT NULL
        REFERENCES public.workshop_comments(id) ON DELETE CASCADE,
    destination_url text NOT NULL CHECK (btrim(destination_url) <> ''),
    shortcode_link_id bigint NOT NULL
        REFERENCES public."ShortcodeLink"(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (comment_id, destination_url),
    UNIQUE (shortcode_link_id)
);

ALTER TABLE public.workshop_comment_shortcode_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_comment_shortcode_links FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_comment_shortcode_links FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_comment_shortcode_links TO service_role;

COMMIT;
