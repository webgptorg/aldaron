import {
    createEnumeratedValueCodec,
    defineUrlViewParameter,
    parseUrlViewState,
    serializeUrlViewState,
    TEXT_VALUE_CODEC,
    type UrlViewParameter,
    type UrlViewValueCodec,
} from '@/lib/api/urlViewState';
import { SHORTCODE_LINK_SOURCE_APP_VALUES, type ShortcodeLinkSourceApp } from '@/lib/shortener/shortcodeLink';
import { parseShortcodeLinkId } from '@/lib/shortener/shortcodeLinkId';

export const SHORTCODE_LINK_CREATION_FILTER_VALUES = ['all', 'manual', 'ad-hoc'] as const;
export const SHORTCODE_LINK_SORT_BY_VALUES = ['createdAt', 'creation', 'sourceApp'] as const;
export const SHORTCODE_LINK_SORT_DIRECTION_VALUES = ['ascending', 'descending'] as const;

export type ShortcodeLinkCreationFilter = (typeof SHORTCODE_LINK_CREATION_FILTER_VALUES)[number];
export type ShortcodeLinkSortBy = (typeof SHORTCODE_LINK_SORT_BY_VALUES)[number];
export type ShortcodeLinkSortDirection = (typeof SHORTCODE_LINK_SORT_DIRECTION_VALUES)[number];

/**
 * Everything which chooses the short-link administration view. It is one value so its list filters and the selected
 * click history are always written into and read from the same shareable address.
 */
export type ShortcodeLinkAdminViewState = {
    readonly searchQuery: string;
    readonly creationFilter: ShortcodeLinkCreationFilter;
    readonly sourceAppFilter: ShortcodeLinkSourceApp | 'all';
    readonly sortBy: ShortcodeLinkSortBy;
    readonly sortDirection: ShortcodeLinkSortDirection;
    readonly selectedShortcodeLinkId: number | null;
};

export const DEFAULT_SHORTCODE_LINK_ADMIN_VIEW_STATE: ShortcodeLinkAdminViewState = {
    searchQuery: '',
    creationFilter: 'all',
    sourceAppFilter: 'all',
    sortBy: 'createdAt',
    sortDirection: 'descending',
    selectedShortcodeLinkId: null,
};

type ShortcodeLinkAdminViewParameter<TValue> = UrlViewParameter<ShortcodeLinkAdminViewState, TValue>;

function defineShortcodeLinkAdminViewParameter<TValue>(
    parameter: ShortcodeLinkAdminViewParameter<TValue>,
): ShortcodeLinkAdminViewParameter<unknown> {
    return defineUrlViewParameter<ShortcodeLinkAdminViewState, TValue>(parameter);
}

const CREATION_FILTER_VALUE_CODEC = createEnumeratedValueCodec(SHORTCODE_LINK_CREATION_FILTER_VALUES);
const SOURCE_APP_FILTER_VALUE_CODEC = createEnumeratedValueCodec([
    'all',
    ...SHORTCODE_LINK_SOURCE_APP_VALUES,
] as const);
const SORT_BY_VALUE_CODEC = createEnumeratedValueCodec(SHORTCODE_LINK_SORT_BY_VALUES);
const SORT_DIRECTION_VALUE_CODEC = createEnumeratedValueCodec(SHORTCODE_LINK_SORT_DIRECTION_VALUES);

const SELECTED_SHORTCODE_LINK_ID_VALUE_CODEC: UrlViewValueCodec<number | null> = {
    parseValue: parseShortcodeLinkId,
    serializeValue: (shortcodeLinkId) => (shortcodeLinkId === null ? '' : shortcodeLinkId.toString()),
};

/**
 * The one description of every URL parameter of the shortener administration. Unknown parameters are preserved by
 * the shared serializer, and default values are omitted so bookmarkable links remain concise.
 */
const SHORTCODE_LINK_ADMIN_VIEW_PARAMETERS: readonly ShortcodeLinkAdminViewParameter<unknown>[] = [
    defineShortcodeLinkAdminViewParameter<string>({
        parameterName: 'search',
        readValue: (viewState) => viewState.searchQuery,
        writeValue: (viewState, searchQuery) => ({ ...viewState, searchQuery }),
        ...TEXT_VALUE_CODEC,
    }),
    defineShortcodeLinkAdminViewParameter<ShortcodeLinkCreationFilter>({
        parameterName: 'creation',
        readValue: (viewState) => viewState.creationFilter,
        writeValue: (viewState, creationFilter) => ({ ...viewState, creationFilter }),
        ...CREATION_FILTER_VALUE_CODEC,
    }),
    defineShortcodeLinkAdminViewParameter<ShortcodeLinkSourceApp | 'all'>({
        parameterName: 'sourceApp',
        readValue: (viewState) => viewState.sourceAppFilter,
        writeValue: (viewState, sourceAppFilter) => ({ ...viewState, sourceAppFilter }),
        ...SOURCE_APP_FILTER_VALUE_CODEC,
    }),
    defineShortcodeLinkAdminViewParameter<ShortcodeLinkSortBy>({
        parameterName: 'sortBy',
        readValue: (viewState) => viewState.sortBy,
        writeValue: (viewState, sortBy) => ({ ...viewState, sortBy }),
        ...SORT_BY_VALUE_CODEC,
    }),
    defineShortcodeLinkAdminViewParameter<ShortcodeLinkSortDirection>({
        parameterName: 'sortDirection',
        readValue: (viewState) => viewState.sortDirection,
        writeValue: (viewState, sortDirection) => ({ ...viewState, sortDirection }),
        ...SORT_DIRECTION_VALUE_CODEC,
    }),
    defineShortcodeLinkAdminViewParameter<number | null>({
        parameterName: 'clicksFor',
        readValue: (viewState) => viewState.selectedShortcodeLinkId,
        writeValue: (viewState, selectedShortcodeLinkId) => ({ ...viewState, selectedShortcodeLinkId }),
        ...SELECTED_SHORTCODE_LINK_ID_VALUE_CODEC,
    }),
];

/**
 * Opens the administration from a shared link, ignoring any parameter which does not describe a safe known view.
 */
export function parseShortcodeLinkAdminViewState(searchParams: URLSearchParams): ShortcodeLinkAdminViewState {
    return parseUrlViewState(
        SHORTCODE_LINK_ADMIN_VIEW_PARAMETERS,
        DEFAULT_SHORTCODE_LINK_ADMIN_VIEW_STATE,
        searchParams,
    );
}

/**
 * Writes the current list filters, sorting, and selected click history into a shareable administration URL.
 */
export function serializeShortcodeLinkAdminViewState(
    viewState: ShortcodeLinkAdminViewState,
    searchParams: URLSearchParams,
): URLSearchParams {
    return serializeUrlViewState(
        SHORTCODE_LINK_ADMIN_VIEW_PARAMETERS,
        DEFAULT_SHORTCODE_LINK_ADMIN_VIEW_STATE,
        viewState,
        searchParams,
    );
}
