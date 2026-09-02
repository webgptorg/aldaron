-- A material can be reserved for the members who pay for the community
-- membership. The room keeps such a material out of the state of everybody
-- who is not paying for it and only says that it is there, which is what the
-- membership offer of the room is then placed on. The video of an ended
-- workshop is unlocked by the very same membership, and needs no column of
-- its own because it is the stream the occurrence already carries.

BEGIN;

ALTER TABLE public.workshop_content_blocks
    ADD COLUMN IF NOT EXISTS is_paid_members_only boolean NOT NULL DEFAULT false;

COMMIT;
