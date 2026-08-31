-- The payment table is deliberately separate from community-room participants: a member may reconnect many times,
-- while their membership is one durable record keyed by e-mail. This privileged page serves the administration and
-- applies its filters before it returns payment details.

BEGIN;

DROP FUNCTION IF EXISTS public.get_community_membership_admin_page(text, text, boolean, text, text, integer, integer);

CREATE FUNCTION public.get_community_membership_admin_page(
    target_search_query text DEFAULT '',
    target_status text DEFAULT NULL,
    target_is_test_payment boolean DEFAULT NULL,
    target_sort_by text DEFAULT 'updatedAt',
    target_sort_direction text DEFAULT 'DESCENDING',
    target_limit integer DEFAULT 50,
    target_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    email text,
    fullname text,
    plan_id text,
    status text,
    monthly_price_czk integer,
    discount_code text,
    discount_percent integer,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_checkout_session_id text,
    is_test_payment boolean,
    current_period_ends_at timestamptz,
    activated_at timestamptz,
    canceled_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    total_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
BEGIN
    IF target_status IS NOT NULL AND target_status NOT IN ('pending', 'active', 'past-due', 'canceled') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_MEMBERSHIP_STATUS_INVALID';
    END IF;

    IF target_sort_by NOT IN (
        'updatedAt',
        'createdAt',
        'fullname',
        'email',
        'status',
        'monthlyPriceCzk',
        'activatedAt',
        'currentPeriodEndsAt',
        'canceledAt'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_MEMBERSHIP_SORT_INVALID';
    END IF;

    IF target_sort_direction NOT IN ('ASCENDING', 'DESCENDING') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_MEMBERSHIP_SORT_DIRECTION_INVALID';
    END IF;

    IF target_limit NOT BETWEEN 1 AND 200 OR target_offset < 0 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_MEMBERSHIP_PAGE_INVALID';
    END IF;

    RETURN QUERY
    WITH matching_memberships AS (
        SELECT
            membership.id,
            membership.email,
            membership.fullname,
            membership.plan_id,
            membership.status,
            membership.monthly_price_czk,
            membership.discount_code,
            membership.discount_percent,
            membership.stripe_customer_id,
            membership.stripe_subscription_id,
            membership.stripe_checkout_session_id,
            membership.is_test_payment,
            membership.current_period_ends_at,
            membership.activated_at,
            membership.canceled_at,
            membership.created_at,
            membership.updated_at
        FROM public.community_memberships AS membership
        WHERE (
                btrim(target_search_query) = ''
                OR membership.fullname ILIKE '%' || btrim(target_search_query) || '%'
                OR membership.email ILIKE '%' || btrim(target_search_query) || '%'
            )
            AND (target_status IS NULL OR membership.status = target_status)
            AND (target_is_test_payment IS NULL OR membership.is_test_payment = target_is_test_payment)
    ), membership_page AS (
        SELECT matching_memberships.*, count(*) OVER ()::bigint AS total_count
        FROM matching_memberships
    )
    SELECT
        membership_page.id,
        membership_page.email,
        membership_page.fullname,
        membership_page.plan_id,
        membership_page.status,
        membership_page.monthly_price_czk,
        membership_page.discount_code,
        membership_page.discount_percent,
        membership_page.stripe_customer_id,
        membership_page.stripe_subscription_id,
        membership_page.stripe_checkout_session_id,
        membership_page.is_test_payment,
        membership_page.current_period_ends_at,
        membership_page.activated_at,
        membership_page.canceled_at,
        membership_page.created_at,
        membership_page.updated_at,
        membership_page.total_count
    FROM membership_page
    ORDER BY
        CASE
            WHEN target_sort_by = 'updatedAt' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.updated_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'updatedAt' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.updated_at
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'createdAt' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.created_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'createdAt' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.created_at
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'fullname' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.fullname
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'fullname' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.fullname
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'email' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.email
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'email' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.email
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'status' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.status
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'status' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.status
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'monthlyPriceCzk' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.monthly_price_czk
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'monthlyPriceCzk' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.monthly_price_czk
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'activatedAt' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.activated_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'activatedAt' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.activated_at
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'currentPeriodEndsAt' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.current_period_ends_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'currentPeriodEndsAt' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.current_period_ends_at
        END DESC NULLS LAST,
        CASE
            WHEN target_sort_by = 'canceledAt' AND target_sort_direction = 'ASCENDING'
                THEN membership_page.canceled_at
        END ASC NULLS LAST,
        CASE
            WHEN target_sort_by = 'canceledAt' AND target_sort_direction = 'DESCENDING'
                THEN membership_page.canceled_at
        END DESC NULLS LAST,
        membership_page.id ASC
    LIMIT target_limit
    OFFSET target_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.get_community_membership_admin_page(text, text, boolean, text, text, integer, integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_membership_admin_page(text, text, boolean, text, text, integer, integer)
    TO service_role;

COMMIT;
