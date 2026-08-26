-- September's free online workshops. The public landing page lists every
-- published future workshop occurrence in chronological order, so inserting
-- these rows is enough to expose a separate registration form for each term.
--
-- A stream URL is intentionally left empty: it belongs to the concrete live
-- broadcast and is set in the workshop administration once it is prepared.

BEGIN;

INSERT INTO public.workshops (
    slug,
    room_kind,
    title,
    description,
    starts_at,
    ends_at,
    youtube_video_id,
    is_published
)
VALUES
    (
        'online-workshop-2026-09-05',
        'workshop',
        'Produkční kód s AI agenty',
        'Online workshop s Pavolem Hejným a Jiřím Jahnem',
        '2026-09-05T16:00:00+02:00',
        '2026-09-05T17:00:00+02:00',
        NULL,
        true
    ),
    (
        'online-workshop-git-ai-2026-09-07',
        'workshop',
        'Git a AI',
        'Online workshop s Pavolem Hejným a Jiřím Jahnem o používání Gitu s AI.',
        '2026-09-07T13:00:00+02:00',
        '2026-09-07T14:00:00+02:00',
        NULL,
        true
    ),
    (
        'online-workshop-ai-databaze-2026-09-11',
        'workshop',
        'AI a databáze',
        'Online workshop s Pavolem Hejným a Jiřím Jahnem o AI a databázích.',
        '2026-09-11T10:00:00+02:00',
        '2026-09-11T11:00:00+02:00',
        NULL,
        true
    ),
    (
        'online-workshop-kontext-projektu-agenti-2026-09-14',
        'workshop',
        'Kontext projektu a agenti',
        'Jak nechat svého AI agenta běžet dlouho a spolehlivě.',
        '2026-09-14T13:00:00+02:00',
        '2026-09-14T14:00:00+02:00',
        NULL,
        true
    )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
