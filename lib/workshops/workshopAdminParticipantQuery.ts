export const WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES = [
    'fullname',
    'email',
    'connectedAt',
    'lastSeenAt',
    'activeDurationSeconds',
    'commentCount',
    'reactionCount',
    'upvoteCount',
] as const;

export type WorkshopAdminParticipantSortBy = (typeof WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES)[number];

export const WORKSHOP_ADMIN_PARTICIPANT_SORT_DIRECTION_VALUES = ['ASCENDING', 'DESCENDING'] as const;

export type WorkshopAdminParticipantSortDirection = (typeof WORKSHOP_ADMIN_PARTICIPANT_SORT_DIRECTION_VALUES)[number];

export type WorkshopAdminParticipantFilters = {
    readonly searchQuery: string;
    readonly isTrusted: boolean | null;
    readonly isModerator: boolean | null;
    readonly isInteractionBanned: boolean | null;
    readonly registeredFrom: string | null;
    readonly registeredTo: string | null;
};

export type WorkshopAdminParticipantQuery = WorkshopAdminParticipantFilters & {
    readonly sortBy: WorkshopAdminParticipantSortBy;
    readonly sortDirection: WorkshopAdminParticipantSortDirection;
    readonly page: number;
    readonly pageSize: number;
};

export const DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY: WorkshopAdminParticipantQuery = {
    searchQuery: '',
    isTrusted: null,
    isModerator: null,
    isInteractionBanned: null,
    registeredFrom: null,
    registeredTo: null,
    sortBy: 'connectedAt',
    sortDirection: 'DESCENDING',
    page: 1,
    pageSize: 50,
};

export const MAXIMAL_WORKSHOP_ADMIN_PARTICIPANT_PAGE_SIZE = 200;

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

function readIsoTimestampOrNull(value: string | null): string | null {
    if (value === null || value === '') {
        return null;
    }

    const timestamp = new Date(value);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
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

/**
 * Reads the participant list view out of an API or export URL.
 *
 * Note: Invalid values deliberately fall back to the safe default, so a manually edited shared admin link cannot
 * make an expensive or malformed database query.
 */
export function parseWorkshopAdminParticipantQuery(searchParams: URLSearchParams): WorkshopAdminParticipantQuery {
    return {
        searchQuery: searchParams.get('search')?.trim().slice(0, 200) ?? '',
        isTrusted: readBooleanOrNull(searchParams.get('trusted')),
        isModerator: readBooleanOrNull(searchParams.get('moderator')),
        isInteractionBanned: readBooleanOrNull(searchParams.get('interactionBanned')),
        registeredFrom: readIsoTimestampOrNull(searchParams.get('registeredFrom')),
        registeredTo: readIsoTimestampOrNull(searchParams.get('registeredTo')),
        sortBy: readEnumeratedValueOrDefault(
            searchParams.get('sortBy'),
            WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES,
            DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY.sortBy,
        ),
        sortDirection: readEnumeratedValueOrDefault(
            searchParams.get('sortDirection'),
            WORKSHOP_ADMIN_PARTICIPANT_SORT_DIRECTION_VALUES,
            DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY.sortDirection,
        ),
        page: readPositiveIntegerOrDefault(searchParams.get('page'), DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY.page, 1_000_000),
        pageSize: readPositiveIntegerOrDefault(
            searchParams.get('pageSize'),
            DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY.pageSize,
            MAXIMAL_WORKSHOP_ADMIN_PARTICIPANT_PAGE_SIZE,
        ),
    };
}

/**
 * Writes the filters and sort in a form shared by the paged API and participant exports.
 */
export function serializeWorkshopAdminParticipantQuery(
    query: WorkshopAdminParticipantQuery,
    searchParams: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
    const nextSearchParams = new URLSearchParams(searchParams);
    const queryValues: Readonly<Record<string, string | null>> = {
        search: query.searchQuery || null,
        trusted: query.isTrusted === null ? null : String(query.isTrusted),
        moderator: query.isModerator === null ? null : String(query.isModerator),
        interactionBanned: query.isInteractionBanned === null ? null : String(query.isInteractionBanned),
        registeredFrom: query.registeredFrom,
        registeredTo: query.registeredTo,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        page: String(query.page),
        pageSize: String(query.pageSize),
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
