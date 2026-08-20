-- Room for the reactions which got an animation of their own.
--
-- Every reaction of a room is celebrated by an animation, and thirteen of them
-- are celebrated their own way. A workshop which wants to offer all of them at
-- once did not fit into the twelve the table allowed, so the guard follows the
-- application constant `MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT` instead. The
-- default of the column offers the whole animated set to a workshop created
-- straight in the database, exactly like the administration does.

BEGIN;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_reactions_count;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_reactions_count CHECK (cardinality(allowed_reactions) BETWEEN 1 AND 16);

ALTER TABLE public.workshops
    ALTER COLUMN allowed_reactions
    SET DEFAULT ARRAY['👍', '❤️', '👏', '🔥', '💡', '😂', '</>', '✨', '🐍', '👀', '🎉', '🎆', '👩‍💻']::text[];

COMMIT;
