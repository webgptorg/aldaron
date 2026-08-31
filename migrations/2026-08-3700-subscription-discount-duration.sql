-- A code can be valid to start a subscription for only a short period while the discount it gives
-- to that subscription lasts permanently, or only through its first selected monthly renewals.
-- `NULL` is intentionally the permanent choice so existing codes keep their original promise.

BEGIN;

ALTER TABLE public.discount_codes
    ADD COLUMN IF NOT EXISTS subscription_discount_duration_months integer;

ALTER TABLE public.discount_codes
    DROP CONSTRAINT IF EXISTS discount_codes_subscription_discount_duration_months_range,
    ADD CONSTRAINT discount_codes_subscription_discount_duration_months_range CHECK (
        subscription_discount_duration_months IS NULL
        OR subscription_discount_duration_months BETWEEN 1 AND 36
    );

-- The result type of a PostgreSQL function cannot be changed in place. Recreate this private
-- consumption function so every server-side registration receives the same duration as previews
-- and Stripe checkout do.
DROP FUNCTION IF EXISTS public.consume_discount_code(text, text);

CREATE FUNCTION public.consume_discount_code(
    discount_code text,
    discount_place_id text
)
RETURNS TABLE (
    status text,
    code text,
    percent integer,
    remaining_use_count integer,
    subscription_discount_duration_months integer
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
            END,
            consumed_discount.subscription_discount_duration_months;
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
        RETURN QUERY SELECT 'exhausted'::text, discount_code, NULL::integer, 0, NULL::integer;
        RETURN;
    END IF;

    RETURN QUERY SELECT 'unusable'::text, discount_code, NULL::integer, NULL::integer, NULL::integer;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_discount_code(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_discount_code(text, text) TO service_role;

COMMIT;
