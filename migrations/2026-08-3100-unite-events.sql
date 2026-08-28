-- Every public event term lives in `public.workshops`, whatever kind of event it is.
--
-- A room which happens at a time is an event: it has a kind of event it is, a
-- place or an online form, a price, and the number of people who fit into it.
-- A permanent room such as the community or a project discussion is not an
-- event at all, so it carries none of these fields.
--
-- The kind of event is deliberately only checked for its format rather than
-- against a list of known values. Offering another kind of event therefore
-- means describing it in the event registry of the application, not migrating
-- the database again.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS event_type text,
    ADD COLUMN IF NOT EXISTS location_kind text,
    ADD COLUMN IF NOT EXISTS location_label text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS price_czk integer,
    ADD COLUMN IF NOT EXISTS maximum_participant_count integer;

-- Every occurrence which already exists is a term of the free online workshop.
UPDATE public.workshops
SET event_type = COALESCE(event_type, 'online-workshop'),
    location_kind = COALESCE(location_kind, 'online'),
    price_czk = COALESCE(price_czk, 0)
WHERE room_kind = 'workshop';

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_event_type_format;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_event_type_format CHECK (
        event_type IS NULL OR event_type ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    );

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_location_kind;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_location_kind CHECK (
        location_kind IS NULL OR location_kind IN ('online', 'onsite')
    );

-- A term which is held somewhere says where, while an online term never does.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_location_label;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_location_label CHECK (
        char_length(location_label) <= 200
        AND (location_kind <> 'onsite' OR char_length(btrim(location_label)) > 0)
    );

-- A price of zero is a free event, which is what the free online workshop is.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_price_czk;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_price_czk CHECK (price_czk IS NULL OR price_czk >= 0);

-- No maximum at all is a term nobody can be turned away from.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_maximum_participant_count;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_maximum_participant_count CHECK (
        maximum_participant_count IS NULL OR maximum_participant_count > 0
    );

-- An occurrence is an event and describes itself as one; a permanent room is not
-- an event and therefore describes nothing of the sort.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_event_fields;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_event_fields CHECK (
        (room_kind = 'workshop') = (event_type IS NOT NULL)
        AND (event_type IS NULL) = (location_kind IS NULL)
        AND (event_type IS NULL) = (price_czk IS NULL)
        AND (event_type IS NOT NULL OR char_length(location_label) = 0)
        AND (event_type IS NOT NULL OR maximum_participant_count IS NULL)
    );

-- The landing page of one kind of event lists its published terms in start order.
CREATE INDEX IF NOT EXISTS workshops_event_type_starts_at_idx
    ON public.workshops (event_type, starts_at ASC)
    WHERE is_published;

-- The terms of the paid one-day workshop, which the application used to carry
-- hard-coded. Their identifiers stay the dates the registrations were written
-- with, so the seats already taken keep being counted against these very terms.
INSERT INTO public.workshops (
    slug,
    room_kind,
    event_type,
    title,
    description,
    starts_at,
    ends_at,
    location_kind,
    location_label,
    price_czk,
    maximum_participant_count,
    youtube_video_id,
    is_published
)
VALUES
    (
        'ai-supervize-mini-2026-09-04',
        'workshop',
        'ai-supervize-mini',
        'AI Supervize Mini · Praha',
        'Celodenní prezenční workshop AI Supervize Mini pro vývojáře a produkťáky.',
        '2026-09-04T10:00:00+02:00',
        '2026-09-04T16:00:00+02:00',
        'onsite',
        'Praha',
        12000,
        10,
        NULL,
        true
    ),
    (
        'ai-supervize-mini-2026-09-09',
        'workshop',
        'ai-supervize-mini',
        'AI Supervize Mini · online',
        'Odpolední online varianta workshopu AI Supervize Mini.',
        '2026-09-09T13:00:00+02:00',
        '2026-09-09T17:00:00+02:00',
        'online',
        '',
        3000,
        50,
        NULL,
        true
    ),
    (
        'ai-supervize-mini-2026-09-18',
        'workshop',
        'ai-supervize-mini',
        'AI Supervize Mini · online',
        'Odpolední online varianta workshopu AI Supervize Mini.',
        '2026-09-18T13:00:00+02:00',
        '2026-09-18T17:00:00+02:00',
        'online',
        '',
        3000,
        50,
        NULL,
        true
    )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
