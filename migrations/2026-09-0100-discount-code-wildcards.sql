-- A terminal `*` makes one discount-code configuration apply to every submitted code which
-- starts with its prefix. The code itself remains the configuration key, so its use count,
-- validity window and allowed places are still shared by every matching submission.

BEGIN;

ALTER TABLE public.discount_codes
    DROP CONSTRAINT IF EXISTS discount_codes_code_format,
    ADD CONSTRAINT discount_codes_code_format CHECK (
        code ~ '^[A-Z0-9]+(?:_[A-Z0-9]+)*(?:_?[*])?$'
    );

-- Preview and consumption both call this resolver. An exact code wins over a wildcard; when more
-- than one wildcard matches, the longest prefix wins. The final ordering makes an otherwise equal
-- legacy configuration deterministic too. The comparison does not use LIKE, so an underscore in a
-- code remains a literal underscore rather than another wildcard.
CREATE OR REPLACE FUNCTION public.resolve_discount_code(
    submitted_discount_code text
)
RETURNS SETOF public.discount_codes
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT discount.*
    FROM public.discount_codes AS discount
    WHERE discount.code = submitted_discount_code
       OR (
            right(discount.code, 1) = '*'
            AND starts_with(
                submitted_discount_code,
                left(discount.code, char_length(discount.code) - 1)
            )
        )
    ORDER BY
        (discount.code = submitted_discount_code) DESC,
        char_length(discount.code) DESC,
        discount.created_at ASC,
        discount.id ASC
    LIMIT 1;
$$;

-- The result signature did not change, so replacing the existing function preserves callers while
-- giving its atomic update the very same wildcard resolver as previews.
CREATE OR REPLACE FUNCTION public.consume_discount_code(
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
    WHERE discount.id = (
        SELECT matching_discount.id
        FROM public.resolve_discount_code(discount_code) AS matching_discount
    )
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
        FROM public.resolve_discount_code(discount_code) AS discount
        WHERE public.is_discount_code_open(discount, discount_place_id)
          AND discount.maximum_use_count IS NOT NULL
          AND discount.use_count >= discount.maximum_use_count
    ) THEN
        RETURN QUERY SELECT 'exhausted'::text, discount_code, NULL::integer, 0, NULL::integer;
        RETURN;
    END IF;

    RETURN QUERY SELECT 'unusable'::text, discount_code, NULL::integer, NULL::integer, NULL::integer;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_discount_code(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_discount_code(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_discount_code(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_discount_code(text, text) TO service_role;

COMMIT;
