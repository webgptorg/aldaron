-- AI Supervize Mini discount codes are private commercial configuration. The
-- public registration route evaluates one submitted code through the service
-- role; the browser never receives a list of available codes.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.ai_supervize_mini_discount_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    percent integer NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true,
    is_online_workshop_follow_up boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ai_supervize_mini_discount_codes_code_format CHECK (code ~ '^[A-Z0-9]+(?:_[A-Z0-9]+)*$'),
    CONSTRAINT ai_supervize_mini_discount_codes_code_length CHECK (char_length(code) BETWEEN 1 AND 100),
    CONSTRAINT ai_supervize_mini_discount_codes_percent_range CHECK (percent BETWEEN 1 AND 100),
    CONSTRAINT ai_supervize_mini_discount_codes_validity_order CHECK (ends_at >= starts_at)
);

-- A stable source link is allowed to point to one administratively selected
-- promotion. The trigger below switches an earlier selection off before this
-- index is checked, so changing the selected code takes one edit.
CREATE UNIQUE INDEX IF NOT EXISTS ai_supervize_mini_discount_codes_online_follow_up_unique
    ON public.ai_supervize_mini_discount_codes (is_online_workshop_follow_up)
    WHERE is_online_workshop_follow_up;
CREATE INDEX IF NOT EXISTS ai_supervize_mini_discount_codes_active_lookup_idx
    ON public.ai_supervize_mini_discount_codes (code, starts_at, ends_at)
    WHERE is_enabled;

CREATE OR REPLACE FUNCTION public.set_ai_supervize_mini_discount_code_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.select_ai_supervize_mini_online_workshop_follow_up_discount()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.is_online_workshop_follow_up THEN
        UPDATE public.ai_supervize_mini_discount_codes
        SET is_online_workshop_follow_up = false
        WHERE id IS DISTINCT FROM NEW.id
          AND is_online_workshop_follow_up;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ai_supervize_mini_discount_codes_set_updated_at
    ON public.ai_supervize_mini_discount_codes;
CREATE TRIGGER ai_supervize_mini_discount_codes_set_updated_at
    BEFORE UPDATE ON public.ai_supervize_mini_discount_codes
    FOR EACH ROW EXECUTE FUNCTION public.set_ai_supervize_mini_discount_code_updated_at();

DROP TRIGGER IF EXISTS ai_supervize_mini_discount_codes_select_online_workshop_follow_up
    ON public.ai_supervize_mini_discount_codes;
CREATE TRIGGER ai_supervize_mini_discount_codes_select_online_workshop_follow_up
    BEFORE INSERT OR UPDATE ON public.ai_supervize_mini_discount_codes
    FOR EACH ROW EXECUTE FUNCTION public.select_ai_supervize_mini_online_workshop_follow_up_discount();

ALTER TABLE public.ai_supervize_mini_discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_supervize_mini_discount_codes FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_supervize_mini_discount_codes FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.ai_supervize_mini_discount_codes TO service_role;

REVOKE ALL ON FUNCTION public.set_ai_supervize_mini_discount_code_updated_at()
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.select_ai_supervize_mini_online_workshop_follow_up_discount()
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_ai_supervize_mini_discount_code_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.select_ai_supervize_mini_online_workshop_follow_up_discount() TO service_role;

-- Preserve the existing hardcoded webinar promotion as data. Its historic
-- validity window remains unchanged; future promotions are administered in
-- /admin/discount-codes.
INSERT INTO public.ai_supervize_mini_discount_codes (
    code,
    percent,
    starts_at,
    ends_at,
    is_enabled,
    is_online_workshop_follow_up
)
VALUES (
    'WEBINAR_2026_08_20',
    25,
    '2026-08-20T00:00:00+02:00',
    '2026-08-20T23:59:59.999+02:00',
    true,
    true
)
ON CONFLICT (code) DO NOTHING;

COMMIT;
