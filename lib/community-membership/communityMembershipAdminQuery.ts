import {
    STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES,
    type StoredCommunityMembershipStatus,
} from '@/lib/community-membership/communityMembershipTypes';

export const COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES = [
    'updatedAt',
    'createdAt',
    'fullname',
    'email',
    'status',
    'monthlyPriceCzk',
    'activatedAt',
    'currentPeriodEndsAt',
    'canceledAt',
] as const;

export type CommunityMembershipAdminSortBy = (typeof COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES)[number];

export const COMMUNITY_MEMBERSHIP_ADMIN_SORT_DIRECTION_VALUES = ['ASCENDING', 'DESCENDING'] as const;

export type CommunityMembershipAdminSortDirection = (typeof COMMUNITY_MEMBERSHIP_ADMIN_SORT_DIRECTION_VALUES)[number];

export type CommunityMembershipAdminQuery = {
    readonly searchQuery: string;
    readonly status: StoredCommunityMembershipStatus | null;
    readonly isTestPayment: boolean | null;
    readonly sortBy: CommunityMembershipAdminSortBy;
    readonly sortDirection: CommunityMembershipAdminSortDirection;
    readonly page: number;
    readonly pageSize: number;
};

export const DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY: CommunityMembershipAdminQuery = {
    searchQuery: '',
    status: null,
    isTestPayment: null,
    sortBy: 'updatedAt',
    sortDirection: 'DESCENDING',
    page: 1,
    pageSize: 50,
};

export const MAXIMAL_COMMUNITY_MEMBERSHIP_ADMIN_PAGE_SIZE = 200;

const COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES = {
    searchQuery: 'membershipSearch',
    status: 'membershipStatus',
    isTestPayment: 'membershipTest',
    sortBy: 'membershipSortBy',
    sortDirection: 'membershipSortDirection',
    page: 'membershipPage',
    pageSize: 'membershipPageSize',
} as const;

function readBooleanOrNull(value: string | null): boolean | null {
    if (value === null || value === '') {
        return null;
    }

    if (value.toLowerCase() === 'true') {
        return true;
    }

    if (value.toLowerCase() === 'false') {
        return false;
    }

    return null;
}

function readPositiveIntegerOrDefault(value: string | null, defaultValue: number, maximalValue: number): number {
    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue) && numberValue > 0 && numberValue <= maximalValue ? numberValue : defaultValue;
}

function readEnumeratedValueOrDefault<Value extends string>(
    value: string | null,
    allowedValues: readonly Value[],
    defaultValue: Value,
): Value {
    if (value === null) {
        return defaultValue;
    }

    return allowedValues.find((allowedValue) => allowedValue.toLowerCase() === value.toLowerCase()) ?? defaultValue;
}

function readStoredStatusOrNull(value: string | null): StoredCommunityMembershipStatus | null {
    if (value === null || value === '') {
        return null;
    }

    return (
        STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES.find(
            (status) => status.toLowerCase() === value.toLowerCase(),
        ) ?? null
    );
}

/**
 * Reads the paid-membership administration view out of a URL. Its names are deliberately scoped to membership
 * administration, so this list never competes with the participant list or overview graph for a shared-link value.
 */
export function parseCommunityMembershipAdminQuery(searchParams: URLSearchParams): CommunityMembershipAdminQuery {
    return {
        searchQuery:
            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.searchQuery)?.trim().slice(0, 200) ?? '',
        status: readStoredStatusOrNull(searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.status)),
        isTestPayment: readBooleanOrNull(searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.isTestPayment)),
        sortBy: readEnumeratedValueOrDefault(
            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortBy),
            COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES,
            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortBy,
        ),
        sortDirection: readEnumeratedValueOrDefault(
            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortDirection),
            COMMUNITY_MEMBERSHIP_ADMIN_SORT_DIRECTION_VALUES,
            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortDirection,
        ),
        page: readPositiveIntegerOrDefault(
            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.page),
            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.page,
            1_000_000,
        ),
        pageSize: readPositiveIntegerOrDefault(
            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.pageSize),
            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.pageSize,
            MAXIMAL_COMMUNITY_MEMBERSHIP_ADMIN_PAGE_SIZE,
        ),
    };
}

/**
 * Writes just this table's controls back into the existing dashboard address while retaining its selected tab and
 * every other view control.
 */
export function serializeCommunityMembershipAdminQuery(
    query: CommunityMembershipAdminQuery,
    searchParams: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
    const nextSearchParams = new URLSearchParams(searchParams);
    const queryValues: Readonly<Record<string, string | null>> = {
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.searchQuery]: query.searchQuery || null,
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.status]: query.status,
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.isTestPayment]:
            query.isTestPayment === null ? null : String(query.isTestPayment),
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortBy]:
            query.sortBy === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortBy ? null : query.sortBy,
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortDirection]:
            query.sortDirection === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortDirection
                ? null
                : query.sortDirection,
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.page]:
            query.page === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.page ? null : String(query.page),
        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.pageSize]:
            query.pageSize === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.pageSize ? null : String(query.pageSize),
    };

    for (const [name, value] of Object.entries(queryValues)) {
        if (value === null) {
            nextSearchParams.delete(name);
        } else {
            nextSearchParams.set(name, value);
        }
    }

    return nextSearchParams;
}
