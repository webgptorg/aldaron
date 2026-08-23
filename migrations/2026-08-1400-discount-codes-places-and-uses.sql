-- Discount codes are application-wide configuration rather than an AI Supervize Mini-only
-- feature. Existing rows are kept while the old table, follow-up flag and single-selection trigger
-- are moved to the shared shape.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF to_regclass('public.discount_codes') IS NULL
       AND to_regclass('public.ai_supervize_mini_discount_codes') IS NOT NULL THEN
        ALTER TABLE public.ai_supervize_mini_discount_codes RENAME TO discount_codes;
    END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.discount_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    percent integer NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true,
    place_ids text[] NOT NULL DEFAULT '{}'::text[],
    maximum_use_count integer,
    use_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT discount_codes_code_format CHECK (code ~ '^[A-Z0-9]+(?:_[A-Z0-9]+)*$'),
    CONSTRAINT discount_codes_code_length CHECK (char_length(code) BETWEEN 1 AND 100),
    CONSTRAINT discount_codes_percent_range CHECK (percent BETWEEN 1 AND 100),
    CONSTRAINT discount_codes_validity_order CHECK (ends_at >= starts_at),
    CONSTRAINT discount_codes_maximum_use_count_range CHECK (
        maximum_use_count IS NULL OR maximum_use_count BETWEEN 1 AND 1000000
    ),
    CONSTRAINT discount_codes_use_count_range CHECK (use_count >= 0)
);

ALTER TABLE public.discount_codes
    ADD COLUMN IF NOT EXISTS place_ids text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.discount_codes
    ADD COLUMN IF NOT EXISTS maximum_use_count integer;
ALTER TABLE public.discount_codes
    ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;

-- The table normally arrives here from the earlier AI Supervize Mini migration. In that case
-- CREATE TABLE above did not run, so add the constraints for the new columns explicitly as well.
-- Dropping first also makes this safe if a partially applied version of this migration is retried.
ALTER TABLE public.discount_codes
    DROP CONSTRAINT IF EXISTS discount_codes_maximum_use_count_range,
    ADD CONSTRAINT discount_codes_maximum_use_count_range CHECK (
        maximum_use_count IS NULL OR maximum_use_count BETWEEN 1 AND 1000000
    );
ALTER TABLE public.discount_codes
    DROP CONSTRAINT IF EXISTS discount_codes_use_count_range,
    ADD CONSTRAINT discount_codes_use_count_range CHECK (use_count >= 0);

-- The old table's constraints keep their original names after the table is renamed. Rename them
-- when present; a newly created final-shape table already has the names below.
DO $$
DECLARE
    renamed_constraint record;
BEGIN
    FOR renamed_constraint IN
        SELECT *
        FROM (
            VALUES
                ('ai_supervize_mini_discount_codes_pkey', 'discount_codes_pkey'),
                ('ai_supervize_mini_discount_codes_code_key', 'discount_codes_code_key'),
                ('ai_supervize_mini_discount_codes_code_format', 'discount_codes_code_format'),
                ('ai_supervize_mini_discount_codes_code_length', 'discount_codes_code_length'),
                ('ai_supervize_mini_discount_codes_percent_range', 'discount_codes_percent_range'),
                ('ai_supervize_mini_discount_codes_validity_order', 'discount_codes_validity_order')
        ) AS renamed_constraint (old_name, new_name)
    LOOP
        IF EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'public.discount_codes'::regclass
              AND conname = renamed_constraint.old_name
        )
           AND NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'public.discount_codes'::regclass
              AND conname = renamed_constraint.new_name
        ) THEN
            EXECUTE format(
                'ALTER TABLE public.discount_codes RENAME CONSTRAINT %I TO %I',
                renamed_constraint.old_name,
                renamed_constraint.new_name
            );
        END IF;
    END LOOP;
END;
$$;

-- Remove the old single online-workshop follow-up selection. Links now carry an explicit `?code=`
-- value, and the code itself carries its valid places.
DROP TRIGGER IF EXISTS ai_supervize_mini_discount_codes_select_online_workshop_follow_up
    ON public.discount_codes;
DROP FUNCTION IF EXISTS public.select_ai_supervize_mini_online_workshop_follow_up_discount();
DROP INDEX IF EXISTS public.ai_supervize_mini_discount_codes_online_follow_up_unique;
DROP INDEX IF EXISTS public.discount_codes_online_follow_up_unique;
ALTER TABLE public.discount_codes DROP COLUMN IF EXISTS is_online_workshop_follow_up;

DROP TRIGGER IF EXISTS ai_supervize_mini_discount_codes_set_updated_at ON public.discount_codes;
DROP TRIGGER IF EXISTS discount_codes_set_updated_at ON public.discount_codes;
DROP FUNCTION IF EXISTS public.set_ai_supervize_mini_discount_code_updated_at();

CREATE OR REPLACE FUNCTION public.set_discount_code_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER discount_codes_set_updated_at
    BEFORE UPDATE ON public.discount_codes
    FOR EACH ROW EXECUTE FUNCTION public.set_discount_code_updated_at();

DROP INDEX IF EXISTS public.discount_codes_active_lookup_idx;
ALTER INDEX IF EXISTS public.ai_supervize_mini_discount_codes_active_lookup_idx
    RENAME TO discount_codes_active_lookup_idx;
CREATE INDEX IF NOT EXISTS discount_codes_active_lookup_idx
    ON public.discount_codes (code, starts_at, ends_at)
    WHERE is_enabled;

-- An empty place list means every current and future place. The same rule is used by preview and
-- consumption, so a displayed discount and a stored discounted registration cannot disagree.
CREATE OR REPLACE FUNCTION public.is_discount_code_open(
    discount public.discount_codes,
    discount_place_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT discount.is_enabled
       AND discount.starts_at <= now()
       AND discount.ends_at >= now()
       AND (cardinality(discount.place_ids) = 0 OR discount_place_id = ANY (discount.place_ids));
$$;

-- A registration consumes one use, regardless of how many participants it contains. The conditional
-- UPDATE takes the row lock before checking the limit, making the last use safe under concurrency.
CREATE OR REPLACE FUNCTION public.consume_discount_code(
    discount_code text,
    discount_place_id text
)
RETURNS TABLE (
    status text,
    code text,
    percent integer,
    remaining_use_count integer
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    consumed_discount public.discount_codes;
BEGIN
    UPDATE public.discount_codes AS discount
    SET use_count = discount.use_count + 1
    WHERE discount.code = discount_code
      AND public.is_discount_code_open(discount, discount_place_id)
      AND (discount.maximum_use_count IS NULL OR discount.use_count < discount.maximum_use_count)
    RETURNING discount.* INTO consumed_discount;

    IF consumed_discount.id IS NOT NULL THEN
        RETURN QUERY
        SELECT
            'applied'::text,
            consumed_discount.code,
            consumed_discount.percent,
            CASE
                WHEN consumed_discount.maximum_use_count IS NULL THEN NULL::integer
                ELSE GREATEST(consumed_discount.maximum_use_count - consumed_discount.use_count, 0)
            END;
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.discount_codes AS discount
        WHERE discount.code = discount_code
          AND public.is_discount_code_open(discount, discount_place_id)
          AND discount.maximum_use_count IS NOT NULL
          AND discount.use_count >= discount.maximum_use_count
    ) THEN
        RETURN QUERY SELECT 'exhausted'::text, discount_code, NULL::integer, 0;
        RETURN;
    END IF;

    RETURN QUERY SELECT 'unusable'::text, discount_code, NULL::integer, NULL::integer;
END;
$$;

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.discount_codes FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.discount_codes TO service_role;

REVOKE ALL ON FUNCTION public.set_discount_code_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_discount_code_open(public.discount_codes, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_discount_code(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_discount_code_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_discount_code_open(public.discount_codes, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_discount_code(text, text) TO service_role;

COMMIT;
