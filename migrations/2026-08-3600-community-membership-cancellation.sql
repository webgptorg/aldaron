-- A cancellation is not necessarily the end of access: Stripe keeps a subscription active until its paid period
-- ends when its next renewal is stopped. Keep that intent explicitly so the member can see and reverse it in the
-- community room without waiting for the final cancellation webhook.

BEGIN;

ALTER TABLE public.community_memberships
    ADD COLUMN IF NOT EXISTS is_cancellation_scheduled boolean NOT NULL DEFAULT false;

COMMIT;
