import moment from 'moment';
import { CONTACT_COLUMN_DEFINITIONS } from './contactColumnDefinitions';
import {
    areContactOriginSelectionsEqual,
    normalizeContactOriginSelections,
    type ContactOriginName,
    type ContactOriginSelection,
} from './contactOrigins';
import {
    CONTACTED_FILTER_VALUES,
    DATE_FILTER_FORMAT,
    DEFAULT_CONTACTS_FILTER,
    PRESENCE_FILTER_VALUES,
    type ContactsFilter,
} from './filterContacts';
import {
    DEFAULT_CONTACTS_PER_PAGE,
    FIRST_CONTACTS_PAGE,
    parseContactsPerPage,
    type ContactsPerPage,
} from './paginateContacts';
import { CONTACTS_SORT_DIRECTIONS, DEFAULT_CONTACTS_SORT_STATE, type ContactsSortState } from './sortContacts';

/**
 * Everything which decides what the contacts table shows, so that the whole view fits into one shareable link
 */
export type ContactsViewState = {
    readonly filter: ContactsFilter;
    readonly sortState: ContactsSortState;
    readonly contactsPerPage: ContactsPerPage;
    readonly currentPage: number;
};

/**
 * View which the dashboard opens with, the one a link without any query parameter leads to
 */
export const DEFAULT_CONTACTS_VIEW_STATE: ContactsViewState = {
    filter: DEFAULT_CONTACTS_FILTER,
    sortState: DEFAULT_CONTACTS_SORT_STATE,
    contactsPerPage: DEFAULT_CONTACTS_PER_PAGE,
    currentPage: FIRST_CONTACTS_PAGE,
};

/**
 * How one value of the view is written into the URL and read back from it
 */
type ContactsViewValueCodec<TValue> = {
    /**
     * @returns `null` when the URL holds something which is not a valid value
     */
    readonly parseValue: (parameterValue: string) => TValue | null;

    readonly serializeValue: (value: TValue) => string;

    /**
     * Does this value have the same meaning as another one?
     *
     * Most view values are strings or numbers and can use strict equality. Origin selections are arrays, so their
     * normalized contents have to be compared instead.
     */
    readonly areValuesEqual?: (firstValue: TValue, secondValue: TValue) => boolean;
};

/**
 * One value of the view together with the URL query parameter which carries it
 */
type ContactsViewParameter<TValue> = ContactsViewValueCodec<TValue> & {
    /**
     * Name of the URL query parameter, kept short so that the shared link stays readable
     */
    readonly parameterName: string;

    readonly readValue: (viewState: ContactsViewState) => TValue;
    readonly writeValue: (viewState: ContactsViewState, value: TValue) => ContactsViewState;
};

/**
 * Describe one parameter of the view with its value type checked, so that all the parameters can live in one list
 *
 * Note: Forgetting the value type is safe here, because a value is only ever written back by the very same parameter
 *       which parsed it
 */
function defineContactsViewParameter<TValue>(parameter: ContactsViewParameter<TValue>): ContactsViewParameter<unknown> {
    return parameter as ContactsViewParameter<unknown>;
}

/**
 * Text which the user typed, carried by the URL exactly as it is
 */
const TEXT_VALUE_CODEC: ContactsViewValueCodec<string> = {
    parseValue: (parameterValue) => parameterValue,
    serializeValue: (value) => value,
};

/**
 * One bound of the date range filter, which is a whole day written as `DATE_FILTER_FORMAT`
 */
const DATE_VALUE_CODEC: ContactsViewValueCodec<string> = {
    parseValue: (parameterValue) =>
        moment(parameterValue, DATE_FILTER_FORMAT, true).isValid() ? parameterValue : null,
    serializeValue: (value) => value,
};

/**
 * Number of the shown page, counted from `FIRST_CONTACTS_PAGE`
 */
const PAGE_VALUE_CODEC: ContactsViewValueCodec<number> = {
    parseValue: (parameterValue) => {
        const page = Number(parameterValue);

        return Number.isSafeInteger(page) && page >= FIRST_CONTACTS_PAGE ? page : null;
    },
    serializeValue: (value) => value.toString(),
};

/**
 * Value which is one of a few known options, understood no matter the letter case, so that a link can also be written by hand
 */
function createEnumeratedValueCodec<TValue extends string>(
    allowedValues: readonly TValue[],
): ContactsViewValueCodec<TValue> {
    return {
        parseValue: (parameterValue) =>
            allowedValues.find((allowedValue) => allowedValue.toLowerCase() === parameterValue.trim().toLowerCase()) ??
            null,
        serializeValue: (value) => value,
    };
}

const PRESENCE_FILTER_VALUE_CODEC = createEnumeratedValueCodec(PRESENCE_FILTER_VALUES);
const CONTACTED_FILTER_VALUE_CODEC = createEnumeratedValueCodec(CONTACTED_FILTER_VALUES);
const SORT_COLUMN_VALUE_CODEC = createEnumeratedValueCodec(CONTACT_COLUMN_DEFINITIONS.map((column) => column.key));
const SORT_DIRECTION_VALUE_CODEC = createEnumeratedValueCodec(CONTACTS_SORT_DIRECTIONS);

const CONTACTS_PER_PAGE_VALUE_CODEC: ContactsViewValueCodec<ContactsPerPage> = {
    parseValue: parseContactsPerPage,
    serializeValue: (value) => value.toString(),
};

/**
 * Is one JSON value a contact origin name which may be selected in the filter?
 */
function isContactOriginName(value: unknown): value is ContactOriginName {
    return value === null || typeof value === 'string';
}

/**
 * Read one list of app-name and place-name selections from the URL.
 *
 * JSON avoids making assumptions about which punctuation a dynamically gathered app or place name may contain.
 */
function parseContactOriginSelections(parameterValue: string): ContactOriginSelection[] | null {
    let parsedValue: unknown;

    try {
        parsedValue = JSON.parse(parameterValue);
    } catch {
        return null;
    }

    if (!Array.isArray(parsedValue)) {
        return null;
    }

    const selections: ContactOriginSelection[] = [];

    for (const parsedSelection of parsedValue) {
        if (typeof parsedSelection !== 'object' || parsedSelection === null || Array.isArray(parsedSelection)) {
            return null;
        }

        const parsedSelectionValues = parsedSelection as Record<string, unknown>;
        const appName = parsedSelectionValues.appName;

        if (!isContactOriginName(appName)) {
            return null;
        }

        if (!Object.prototype.hasOwnProperty.call(parsedSelectionValues, 'placeName')) {
            selections.push({ appName });
            continue;
        }

        const placeName = parsedSelectionValues.placeName;

        if (!isContactOriginName(placeName)) {
            return null;
        }

        selections.push({ appName, placeName });
    }

    return normalizeContactOriginSelections(selections);
}

const CONTACT_ORIGIN_SELECTIONS_VALUE_CODEC: ContactsViewValueCodec<readonly ContactOriginSelection[]> = {
    parseValue: parseContactOriginSelections,
    serializeValue: (selections) => JSON.stringify(normalizeContactOriginSelections(selections)),
    areValuesEqual: areContactOriginSelectionsEqual,
};

/**
 * Describe one value of the filter, all of which are carried by one query parameter each
 */
function defineContactsFilterParameter<TFilterKey extends keyof ContactsFilter>(
    filterKey: TFilterKey,
    parameterName: string,
    valueCodec: ContactsViewValueCodec<ContactsFilter[TFilterKey]>,
): ContactsViewParameter<unknown> {
    return defineContactsViewParameter<ContactsFilter[TFilterKey]>({
        parameterName,
        readValue: (viewState) => viewState.filter[filterKey],
        writeValue: (viewState, value) => ({ ...viewState, filter: { ...viewState.filter, [filterKey]: value } }),
        ...valueCodec,
    });
}

/**
 * Describe one value of the sorting, which is the sorted column and its direction
 */
function defineContactsSortParameter<TSortKey extends keyof ContactsSortState>(
    sortKey: TSortKey,
    parameterName: string,
    valueCodec: ContactsViewValueCodec<ContactsSortState[TSortKey]>,
): ContactsViewParameter<unknown> {
    return defineContactsViewParameter<ContactsSortState[TSortKey]>({
        parameterName,
        readValue: (viewState) => viewState.sortState[sortKey],
        writeValue: (viewState, value) => ({ ...viewState, sortState: { ...viewState.sortState, [sortKey]: value } }),
        ...valueCodec,
    });
}

/**
 * Every value of the view together with the query parameter which carries it
 *
 * Note: This is the single source of truth of the shareable link, both for reading it and for writing it
 */
const CONTACTS_VIEW_PARAMETERS: readonly ContactsViewParameter<unknown>[] = [
    defineContactsFilterParameter('searchQuery', 'search', TEXT_VALUE_CODEC),
    defineContactsFilterParameter('createdFromDate', 'createdFrom', DATE_VALUE_CODEC),
    defineContactsFilterParameter('createdToDate', 'createdTo', DATE_VALUE_CODEC),
    defineContactsFilterParameter('emailPresence', 'email', PRESENCE_FILTER_VALUE_CODEC),
    defineContactsFilterParameter('phonePresence', 'phone', PRESENCE_FILTER_VALUE_CODEC),
    defineContactsFilterParameter('userNotePresence', 'userNote', PRESENCE_FILTER_VALUE_CODEC),
    defineContactsFilterParameter('contactedStatus', 'contacted', CONTACTED_FILTER_VALUE_CODEC),
    defineContactsFilterParameter('contactOriginSelections', 'origins', CONTACT_ORIGIN_SELECTIONS_VALUE_CODEC),
    defineContactsSortParameter('columnKey', 'sortBy', SORT_COLUMN_VALUE_CODEC),
    defineContactsSortParameter('direction', 'sortDirection', SORT_DIRECTION_VALUE_CODEC),
    defineContactsViewParameter<ContactsPerPage>({
        parameterName: 'perPage',
        readValue: (viewState) => viewState.contactsPerPage,
        writeValue: (viewState, contactsPerPage) => ({ ...viewState, contactsPerPage }),
        ...CONTACTS_PER_PAGE_VALUE_CODEC,
    }),
    defineContactsViewParameter<number>({
        parameterName: 'page',
        readValue: (viewState) => viewState.currentPage,
        writeValue: (viewState, currentPage) => ({ ...viewState, currentPage }),
        ...PAGE_VALUE_CODEC,
    }),
];

/**
 * Read the view of the contacts table out of a shared link
 *
 * Note: Every value which is missing or which makes no sense falls back to the default one, so that an old or a hand
 *       written link always opens the dashboard
 */
export function parseContactsViewState(searchParams: URLSearchParams): ContactsViewState {
    return CONTACTS_VIEW_PARAMETERS.reduce((viewState, parameter) => {
        const parameterValue = searchParams.get(parameter.parameterName);

        if (parameterValue === null) {
            return viewState;
        }

        const value = parameter.parseValue(parameterValue);
        return value === null ? viewState : parameter.writeValue(viewState, value);
    }, DEFAULT_CONTACTS_VIEW_STATE);
}

/**
 * Write the view of the contacts table into the query parameters of the link which can be shared
 *
 * Note: The parameters which do not describe the view, like the admin token, are kept as they are and the values which
 *       are the default ones are left out, so that the shared link stays as short as possible
 *
 * @returns New query parameters, the given ones are never mutated
 */
export function serializeContactsViewState(
    viewState: ContactsViewState,
    searchParams: URLSearchParams,
): URLSearchParams {
    const newSearchParams = new URLSearchParams(searchParams);

    for (const parameter of CONTACTS_VIEW_PARAMETERS) {
        const value = parameter.readValue(viewState);
        const defaultValue = parameter.readValue(DEFAULT_CONTACTS_VIEW_STATE);
        const isDefaultValue = parameter.areValuesEqual?.(value, defaultValue) ?? value === defaultValue;

        if (isDefaultValue) {
            newSearchParams.delete(parameter.parameterName);
        } else {
            newSearchParams.set(parameter.parameterName, parameter.serializeValue(value));
        }
    }

    return newSearchParams;
}
