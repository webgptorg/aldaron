import {
    COMMUNITY_MEMBERSHIP_TABLE_NAME,
    normalizeCommunityMemberEmail,
    type CommunityMembershipStatus,
    type StoredCommunityMembershipStatus,
} from '@/lib/community-membership/communityMembershipTypes';
import type { CommunityMembershipAdminQuery } from '@/lib/community-membership/communityMembershipAdminQuery';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { reportSupabaseError } from '@/lib/supabase/reportSupabaseError';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Note: This stays one literal, because the database client reads the requested columns out of the text itself.
 */
const COMMUNITY_MEMBERSHIP_COLUMNS =
    'id, email, fullname, plan_id, status, monthly_price_czk, discount_code, discount_percent, stripe_customer_id, stripe_subscription_id, stripe_checkout_session_id, is_test_payment, current_period_ends_at, activated_at, canceled_at, created_at, updated_at';

const COMMUNITY_MEMBERSHIP_ADMIN_PAGE_FUNCTION_NAME = 'get_community_membership_admin_page';

type CommunityMembershipRow = {
    readonly id: string;
    readonly email: string;
    readonly fullname: string;
    readonly plan_id: string;
    readonly status: string;
    readonly monthly_price_czk: number;
    readonly discount_code: string | null;
    readonly discount_percent: number;
    readonly stripe_customer_id: string | null;
    readonly stripe_subscription_id: string | null;
    readonly stripe_checkout_session_id: string | null;
    readonly is_test_payment: boolean;
    readonly current_period_ends_at: string | null;
    readonly activated_at: string | null;
    readonly canceled_at: string | null;
    readonly created_at: string;
    readonly updated_at: string;
};

type CommunityMembershipAdminPageRow = CommunityMembershipRow & {
    readonly total_count: number | string;
};

/**
 * One stored membership, as everything but the payment gate reads it
 */
export type CommunityMembershipRecord = {
    readonly id: string;
    readonly email: string;
    readonly fullname: string;
    readonly planId: string;
    readonly status: StoredCommunityMembershipStatus;
    readonly monthlyPriceCzk: number;
    readonly discountCode: string | null;
    readonly discountPercent: number;
    readonly stripeCustomerId: string | null;
    readonly stripeSubscriptionId: string | null;
    readonly stripeCheckoutSessionId: string | null;
    readonly isTestPayment: boolean;
    readonly currentPeriodEndsAt: string | null;
    readonly activatedAt: string | null;
    readonly canceledAt: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

export type CommunityMembershipLoadResult = {
    readonly membership: CommunityMembershipRecord | null;
    readonly errorMessage: string | null;
};

/**
 * A server-paged slice of payment records. It deliberately represents only people who opened a paid checkout; a
 * member with the free membership has no payment record to manage.
 */
export type CommunityMembershipAdminPage = {
    readonly memberships: readonly CommunityMembershipRecord[];
    readonly totalCount: number;
};

/**
 * What one member agreed to when they opened a checkout
 */
export type RequestedCommunityMembershipValues = {
    readonly email: string;
    readonly fullname: string;
    readonly planId: string;
    readonly monthlyPriceCzk: number;
    readonly discountCode: string | null;
    readonly discountPercent: number;
    readonly stripeCheckoutSessionId: string;
    readonly isTestPayment: boolean;
    readonly requestedByParticipantId: string;
};

/**
 * What the payment gate reported about a membership it now charges for
 */
export type PaidCommunityMembershipValues = {
    readonly status: StoredCommunityMembershipStatus;
    readonly stripeCustomerId: string | null;
    readonly stripeSubscriptionId: string | null;
    readonly currentPeriodEndsAt: string | null;
};

/**
 * Memberships are readable only through the service role, because the table says what somebody paid for.
 */
export function getCommunityMembershipDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

function mapCommunityMembershipRow(row: CommunityMembershipRow): CommunityMembershipRecord {
    return {
        id: row.id,
        email: row.email,
        fullname: row.fullname,
        planId: row.plan_id,
        status: row.status as StoredCommunityMembershipStatus,
        monthlyPriceCzk: row.monthly_price_czk,
        discountCode: row.discount_code,
        discountPercent: row.discount_percent,
        stripeCustomerId: row.stripe_customer_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        stripeCheckoutSessionId: row.stripe_checkout_session_id,
        isTestPayment: row.is_test_payment,
        currentPeriodEndsAt: row.current_period_ends_at,
        activatedAt: row.activated_at,
        canceledAt: row.canceled_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function getNonNegativeWholeNumber(value: number | string | undefined): number {
    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue) && numberValue >= 0 ? numberValue : 0;
}

async function loadCommunityMembershipBy(
    supabase: SupabaseClient,
    column: string,
    value: string,
    operationName: string,
): Promise<CommunityMembershipLoadResult> {
    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .select(COMMUNITY_MEMBERSHIP_COLUMNS)
        .eq(column, value)
        .maybeSingle();

    if (error) {
        return { membership: null, errorMessage: reportSupabaseError(operationName, error) };
    }

    return {
        membership: data === null ? null : mapCommunityMembershipRow(data as CommunityMembershipRow),
        errorMessage: null,
    };
}

export function loadCommunityMembershipByEmail(
    supabase: SupabaseClient,
    email: string,
): Promise<CommunityMembershipLoadResult> {
    return loadCommunityMembershipBy(
        supabase,
        'email',
        normalizeCommunityMemberEmail(email),
        'the membership of a community member',
    );
}

export function loadCommunityMembershipByCheckoutSession(
    supabase: SupabaseClient,
    stripeCheckoutSessionId: string,
): Promise<CommunityMembershipLoadResult> {
    return loadCommunityMembershipBy(
        supabase,
        'stripe_checkout_session_id',
        stripeCheckoutSessionId,
        'the membership of a checkout session',
    );
}

/**
 * Loads all paid-membership states needed by one page of community participants in one query. The membership is keyed
 * by normalized e-mail because a person can open more than one community-room session.
 */
export async function loadCommunityMembershipStatusesByEmails(
    supabase: SupabaseClient,
    emails: readonly string[],
): Promise<{
    readonly statusesByEmail: ReadonlyMap<string, StoredCommunityMembershipStatus>;
    readonly errorMessage: string | null;
}> {
    const normalizedEmails = Array.from(
        new Set(emails.map(normalizeCommunityMemberEmail).filter((email) => email !== '')),
    );
    if (normalizedEmails.length === 0) {
        return { statusesByEmail: new Map(), errorMessage: null };
    }

    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .select('email, status')
        .in('email', normalizedEmails);
    if (error) {
        return {
            statusesByEmail: new Map(),
            errorMessage: reportSupabaseError('the membership statuses of community participants', error),
        };
    }

    const statusesByEmail = new Map<string, StoredCommunityMembershipStatus>();
    for (const row of (data ?? []) as readonly { readonly email: string; readonly status: string }[]) {
        statusesByEmail.set(normalizeCommunityMemberEmail(row.email), row.status as StoredCommunityMembershipStatus);
    }

    return { statusesByEmail, errorMessage: null };
}

/**
 * Answers the shared status badge for an e-mail, including the free state which has no row in the payment table.
 */
export function getCommunityMembershipStatusByEmail(
    statusesByEmail: ReadonlyMap<string, StoredCommunityMembershipStatus>,
    email: string,
): CommunityMembershipStatus {
    return statusesByEmail.get(normalizeCommunityMemberEmail(email)) ?? 'none';
}

/**
 * Loads one filtered, sorted page of paid memberships. The database does filtering and paging before private payment
 * data leaves it, which keeps the administration responsive as the community grows.
 */
export async function loadCommunityMembershipAdminPage(
    supabase: SupabaseClient,
    query: CommunityMembershipAdminQuery,
): Promise<{ readonly page: CommunityMembershipAdminPage | null; readonly errorMessage: string | null }> {
    const pageParameters = {
        target_search_query: query.searchQuery,
        target_status: query.status,
        target_is_test_payment: query.isTestPayment,
        target_sort_by: query.sortBy,
        target_sort_direction: query.sortDirection,
        target_limit: query.pageSize,
        target_offset: (query.page - 1) * query.pageSize,
    };
    const { data, error } = await supabase.rpc(COMMUNITY_MEMBERSHIP_ADMIN_PAGE_FUNCTION_NAME, pageParameters);
    if (error) {
        return {
            page: null,
            errorMessage: reportSupabaseError(
                `\`${COMMUNITY_MEMBERSHIP_ADMIN_PAGE_FUNCTION_NAME}\``,
                error,
                pageParameters,
            ),
        };
    }

    const membershipRows = (data ?? []) as CommunityMembershipAdminPageRow[];
    return {
        page: {
            memberships: membershipRows.map(mapCommunityMembershipRow),
            totalCount: getNonNegativeWholeNumber(membershipRows[0]?.total_count),
        },
        errorMessage: null,
    };
}

/**
 * Records the offer a member accepted before they are sent to the payment gate.
 *
 * Note: The membership is written before the gate is even opened, so a payment which is confirmed by a webhook long
 *       after the browser was closed still finds the member, the plan and the price it belongs to.
 */
export async function saveRequestedCommunityMembership(
    supabase: SupabaseClient,
    existingMembershipId: string | null,
    values: RequestedCommunityMembershipValues,
): Promise<{ readonly errorMessage: string | null }> {
    const membershipValues = {
        email: normalizeCommunityMemberEmail(values.email),
        fullname: values.fullname,
        plan_id: values.planId,
        status: 'pending' satisfies StoredCommunityMembershipStatus,
        monthly_price_czk: values.monthlyPriceCzk,
        discount_code: values.discountCode,
        discount_percent: values.discountPercent,
        stripe_checkout_session_id: values.stripeCheckoutSessionId,
        is_test_payment: values.isTestPayment,
        requested_by_participant_id: values.requestedByParticipantId,
        // A membership which is being bought again describes that attempt alone, so nothing the gate decides about the
        // subscription somebody left behind can be mistaken for a decision about the new one.
        stripe_subscription_id: null,
        current_period_ends_at: null,
        activated_at: null,
        canceled_at: null,
    };

    const { error } =
        existingMembershipId === null
            ? await supabase.from(COMMUNITY_MEMBERSHIP_TABLE_NAME).insert(membershipValues)
            : await supabase
                  .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
                  .update(membershipValues)
                  .eq('id', existingMembershipId);

    return {
        errorMessage: error ? reportSupabaseError('the requested community membership', error) : null,
    };
}

/**
 * Turns a membership which was only requested into one which is being paid for.
 *
 * Note: Only a membership which is not paid for yet is changed, and the answer says whether this call is the one which
 *       changed it. The return from the gate and its webhook therefore both confirm the very same payment, while
 *       whatever must happen exactly once happens exactly once.
 */
export async function markCommunityMembershipPaid(
    supabase: SupabaseClient,
    membershipId: string,
    values: PaidCommunityMembershipValues,
): Promise<{ readonly isNewlyPaid: boolean; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .update({
            status: values.status,
            stripe_customer_id: values.stripeCustomerId,
            stripe_subscription_id: values.stripeSubscriptionId,
            current_period_ends_at: values.currentPeriodEndsAt,
            activated_at: new Date().toISOString(),
        })
        .eq('id', membershipId)
        .eq('status', 'pending' satisfies StoredCommunityMembershipStatus)
        .select('id');

    if (error) {
        return { isNewlyPaid: false, errorMessage: reportSupabaseError('the paid community membership', error) };
    }

    return { isNewlyPaid: (data ?? []).length > 0, errorMessage: null };
}

/**
 * Follows a membership the gate keeps deciding about, such as one which was cancelled or whose card stopped working.
 */
export async function saveCommunityMembershipSubscriptionState(
    supabase: SupabaseClient,
    stripeSubscriptionId: string,
    values: {
        readonly status: StoredCommunityMembershipStatus;
        readonly currentPeriodEndsAt: string | null;
    },
): Promise<{ readonly isMembershipFound: boolean; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .update({
            status: values.status,
            current_period_ends_at: values.currentPeriodEndsAt,
            canceled_at: values.status === 'canceled' ? new Date().toISOString() : null,
        })
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .select('id');

    if (error) {
        return {
            isMembershipFound: false,
            errorMessage: reportSupabaseError('the community membership of a subscription', error),
        };
    }

    return { isMembershipFound: (data ?? []).length > 0, errorMessage: null };
}
