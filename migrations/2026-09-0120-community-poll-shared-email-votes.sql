-- One community poll can be answered from its own room or from any workshop occurrence it is attached to.
--
-- A participant session belongs to one room, while the poll belongs to the permanent community. The voter identity is
-- therefore the normalized e-mail address that the participant already verified, rather than a room-local participant
-- id. The room-local id remains useful audit context, but it can no longer be the unique voter key.

BEGIN;

ALTER TABLE public.workshop_poll_votes
    ADD COLUMN IF NOT EXISTS voter_email text;

-- Every earlier vote came from the community which owned its poll, so its participant supplies the durable e-mail
-- identity. Refuse an inconsistent database instead of quietly losing a vote while making the new identity mandatory.
UPDATE public.workshop_poll_votes AS poll_vote
SET voter_email = lower(btrim(participant.email))
FROM public.workshop_participants AS participant
WHERE participant.id = poll_vote.participant_id
  AND poll_vote.voter_email IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.workshop_poll_votes
        WHERE voter_email IS NULL
    ) THEN
        RAISE EXCEPTION 'WORKSHOP_POLL_VOTER_EMAIL_MISSING';
    END IF;
END;
$$;

-- A returning member could previously have a new community participant row. Once a vote is defined by e-mail, their
-- latest selection is the one choice which remains, matching the option-changing behavior of a normal vote.
WITH duplicate_votes AS (
    SELECT
        id,
        row_number() OVER (
            PARTITION BY poll_id, voter_email
            ORDER BY updated_at DESC, created_at DESC, id DESC
        ) AS duplicate_position
    FROM public.workshop_poll_votes
)
DELETE FROM public.workshop_poll_votes AS poll_vote
USING duplicate_votes
WHERE poll_vote.id = duplicate_votes.id
  AND duplicate_votes.duplicate_position > 1;

ALTER TABLE public.workshop_poll_votes
    ALTER COLUMN voter_email SET NOT NULL;

ALTER TABLE public.workshop_poll_votes
    DROP CONSTRAINT IF EXISTS workshop_poll_votes_voter_email_normalized;
ALTER TABLE public.workshop_poll_votes
    ADD CONSTRAINT workshop_poll_votes_voter_email_normalized CHECK (
        char_length(voter_email) BETWEEN 3 AND 320
        AND voter_email = lower(btrim(voter_email))
    );

ALTER TABLE public.workshop_poll_votes
    DROP CONSTRAINT IF EXISTS workshop_poll_votes_one_per_participant;
ALTER TABLE public.workshop_poll_votes
    ADD CONSTRAINT workshop_poll_votes_one_per_voter_email UNIQUE (poll_id, voter_email);

-- The originating session may now belong to an attached workshop rather than to the community that owns the poll.
-- Keep that useful attribution while allowing the participant record to disappear without erasing the e-mail-owned
-- community decision.
ALTER TABLE public.workshop_poll_votes
    DROP CONSTRAINT IF EXISTS workshop_poll_votes_participant_fk;
ALTER TABLE public.workshop_poll_votes
    ALTER COLUMN participant_id DROP NOT NULL;
ALTER TABLE public.workshop_poll_votes
    ADD CONSTRAINT workshop_poll_votes_participant_fk FOREIGN KEY (participant_id)
        REFERENCES public.workshop_participants(id) ON DELETE SET NULL;

-- The public route calls one transaction which proves all of the relationships together: a verified participant may
-- vote only in the room they entered, and that room must either own the visible poll or be an occurrence attached to
-- it. The poll row lock also serializes a vote with an administrator closing or hiding the poll.
CREATE OR REPLACE FUNCTION public.set_community_workshop_poll_vote(
    target_room_id uuid,
    target_poll_id uuid,
    target_option_id uuid,
    target_participant_id uuid,
    target_voter_email text
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    poll_owner_workshop_id uuid;
    poll_is_closed boolean;
    poll_is_visible boolean;
    normalized_voter_email text;
BEGIN
    normalized_voter_email := lower(btrim(target_voter_email));
    IF normalized_voter_email IS NULL OR char_length(normalized_voter_email) NOT BETWEEN 3 AND 320 THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_VOTER_EMAIL_INVALID';
    END IF;

    SELECT poll.workshop_id, poll.is_closed, poll.is_visible
    INTO poll_owner_workshop_id, poll_is_closed, poll_is_visible
    FROM public.workshop_polls AS poll
    WHERE poll.id = target_poll_id
    FOR SHARE;

    IF NOT FOUND OR NOT poll_is_visible THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_VISIBLE';
    END IF;
    IF poll_is_closed THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_CLOSED';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS participant
        WHERE participant.id = target_participant_id
          AND participant.workshop_id = target_room_id
          AND lower(btrim(participant.email)) = normalized_voter_email
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_PARTICIPANT_INVALID';
    END IF;

    IF poll_owner_workshop_id <> target_room_id
       AND NOT EXISTS (
           SELECT 1
           FROM public.workshop_poll_workshops AS attachment
           WHERE attachment.poll_id = target_poll_id
             AND attachment.workshop_id = target_room_id
       ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_ATTACHED';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_poll_options AS poll_option
        WHERE poll_option.id = target_option_id
          AND poll_option.poll_id = target_poll_id
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OPTION_NOT_FOUND';
    END IF;

    INSERT INTO public.workshop_poll_votes (
        workshop_id,
        poll_id,
        option_id,
        participant_id,
        voter_email
    )
    VALUES (
        poll_owner_workshop_id,
        target_poll_id,
        target_option_id,
        target_participant_id,
        normalized_voter_email
    )
    ON CONFLICT (poll_id, voter_email) DO UPDATE
    SET
        option_id = EXCLUDED.option_id,
        participant_id = EXCLUDED.participant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_community_workshop_poll_vote(uuid, uuid, uuid, uuid, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_community_workshop_poll_vote(uuid, uuid, uuid, uuid, text)
    TO service_role;

COMMIT;
