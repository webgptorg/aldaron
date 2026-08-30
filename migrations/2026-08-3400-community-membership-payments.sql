-- Paid community membership bought inside the community room itself.
--
-- A membership belongs to the person rather than to one room session: connecting to the community creates a new
-- participant row every time, so the durable identity of a paying member is the address they connect with. The row
-- mirrors what the payment gate decided, which keeps the room able to answer "am I a paid member" without asking
-- Stripe on every request, while Stripe remains the source of truth behind it.

BEGIN;

CREATE TABLE IF NOT EXISTS public.community_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    fullname text NOT NULL DEFAULT '',
    plan_id text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    monthly_price_czk integer NOT NULL,
    discount_code text,
    discount_percent integer NOT NULL DEFAULT 0,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_checkout_session_id text,
    -- Whether the gate which created this row ran on test keys, so a rehearsal is never counted as a real membership.
    is_test_payment boolean NOT NULL DEFAULT false,
    requested_by_participant_id uuid REFERENCES public.workshop_participants(id) ON DELETE SET NULL,
    current_period_ends_at timestamptz,
    activated_at timestamptz,
    canceled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT community_memberships_email_length CHECK (char_length(email) BETWEEN 3 AND 320),
    CONSTRAINT community_memberships_email_normalized CHECK (email = lower(btrim(email))),
    CONSTRAINT community_memberships_fullname_length CHECK (char_length(fullname) <= 200),
    CONSTRAINT community_memberships_plan_id_length CHECK (char_length(plan_id) BETWEEN 1 AND 64),
    CONSTRAINT community_memberships_status CHECK (status IN ('pending', 'active', 'past-due', 'canceled')),
    CONSTRAINT community_memberships_monthly_price_czk CHECK (monthly_price_czk >= 0),
    CONSTRAINT community_memberships_discount_percent CHECK (discount_percent BETWEEN 0 AND 100),
    CONSTRAINT community_memberships_discount_code_length CHECK (
        discount_code IS NULL OR char_length(discount_code) BETWEEN 1 AND 64
    )
);

-- One membership per member, which is what lets a returning member be recognised from a brand new room session.
CREATE UNIQUE INDEX IF NOT EXISTS community_memberships_email_key
    ON public.community_memberships (email);

-- A subscription and a checkout session each identify exactly one membership, so a webhook which arrives twice, or
-- out of order, updates that very membership instead of creating a second one.
CREATE UNIQUE INDEX IF NOT EXISTS community_memberships_stripe_subscription_key
    ON public.community_memberships (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS community_memberships_stripe_checkout_session_key
    ON public.community_memberships (stripe_checkout_session_id)
    WHERE stripe_checkout_session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_community_membership_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_memberships_set_updated_at ON public.community_memberships;
CREATE TRIGGER community_memberships_set_updated_at
    BEFORE UPDATE ON public.community_memberships
    FOR EACH ROW EXECUTE FUNCTION public.set_community_membership_updated_at();

-- A membership says what somebody paid for, so it is readable only by the server which talks to the payment gate.
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.community_memberships FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.community_memberships TO service_role;

REVOKE ALL ON FUNCTION public.set_community_membership_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_community_membership_updated_at() TO service_role;

COMMIT;
