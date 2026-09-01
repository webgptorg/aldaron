-- A `*` now stands for zero or more normalized code characters wherever it appears. The prior
-- terminal-wildcard migration remains immutable, so this migration widens both the stored format
-- and its one shared resolver without changing the history already applied to a database.

BEGIN;

ALTER TABLE public.discount_codes
    DROP CONSTRAINT IF EXISTS discount_codes_code_format,
    ADD CONSTRAINT discount_codes_code_format CHECK (
        code ~ '^[A-Z0-9*]+(?:_[A-Z0-9*]+)*$'
    );

-- Stored codes may contain only literal normalized characters, underscores and `*`, so replacing
-- the latter with `.*` safely turns a configured rule into an anchored PostgreSQL pattern. Exact
-- codes win. Among matching rules, more literal text is more specific; fewer wildcards make an
-- otherwise equally literal rule win, and the final order keeps equivalent rules deterministic.
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
            position('*' IN discount.code) > 0
            AND submitted_discount_code ~ ('^' || replace(discount.code, '*', '.*') || '$')
        )
    ORDER BY
        (discount.code = submitted_discount_code) DESC,
        char_length(replace(discount.code, '*', '')) DESC,
        (char_length(discount.code) - char_length(replace(discount.code, '*', ''))) ASC,
        discount.created_at ASC,
        discount.id ASC
    LIMIT 1;
$$;

-- `consume_discount_code` already resolves through this function immediately before its conditional
-- update, so replacing this resolver keeps previews and atomic consumption on the same rule.

COMMIT;
