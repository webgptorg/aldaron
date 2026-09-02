-- The recording of an ended workshop is unlocked by the paid community
-- membership and needs no column of its own, because it is the very stream the
-- occurrence already carries. What a member who has not paid is shown in its
-- place does need one: an administrator can publish a teaser of that recording,
-- which stands on the stage once the workshop is over while the recording
-- itself stays with the members whose membership unlocks it.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS preview_youtube_video_id text;

COMMIT;
