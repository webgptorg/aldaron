-- One persistent community built on the established live-room infrastructure.
--
-- Workshops remain individual occurrences. The community is deliberately a room kind rather than a copied set of
-- participant, chat, reaction, and moderation tables: the existing RLS boundary, audit trail, and administration
-- therefore apply identically, while the partial unique index makes a second community impossible.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS room_kind text NOT NULL DEFAULT 'workshop';

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_room_kind;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_room_kind CHECK (room_kind IN ('workshop', 'community'));

CREATE UNIQUE INDEX IF NOT EXISTS workshops_one_community_idx
    ON public.workshops (room_kind)
    WHERE room_kind = 'community';

-- The public Czech route is stable. Keeping this slug stable prevents an ordinary settings edit from disconnecting
-- existing community links from the persistent room behind them.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_community_slug;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_community_slug CHECK (room_kind <> 'community' OR slug = 'komunita');

-- A pre-existing row with the intended stable slug is promoted once during deployment. This makes an earlier manual
-- setup safe to keep, while the partial unique index still refuses a second community.
UPDATE public.workshops
SET room_kind = 'community'
WHERE slug = 'komunita'
  AND NOT EXISTS (
      SELECT 1
      FROM public.workshops AS existing_community
      WHERE existing_community.room_kind = 'community'
  );

INSERT INTO public.workshops (
    slug,
    room_kind,
    title,
    description,
    starts_at,
    ends_at,
    is_published
)
SELECT
    'komunita',
    'community',
    'Komunita Promptbooku',
    'Společný prostor pro účastníky workshopů Promptbooku.',
    '2026-01-01T00:00:00+00:00',
    NULL,
    true
WHERE NOT EXISTS (
    SELECT 1
    FROM public.workshops
    WHERE room_kind = 'community'
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
