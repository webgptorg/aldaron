import {
    createEnumeratedValueCodec,
    defineUrlViewParameter,
    parseUrlViewState,
    serializeUrlViewState,
    type UrlViewParameter,
    type UrlViewValueCodec,
} from '@/lib/api/urlViewState';
import {
    MAXIMAL_WORKSHOP_OVERVIEW_CUSTOM_METRIC_COUNT,
    WORKSHOP_OVERVIEW_SERIES_KEYS,
    type WorkshopOverviewSeriesKey,
} from '@/lib/workshops/workshopOverviewSeries';

/**
 * A line counted from the messages which match a regular expression, for example every question about a price
 */
export type WorkshopOverviewCustomMetric = {
    /**
     * What the legend calls the line, which falls back to the expression itself
     */
    readonly label: string;

    /**
     * The regular expression a message has to match, always read without regard to the letter case
     */
    readonly pattern: string;
};

/**
 * Everything which decides what the overview graph draws, so that the whole graph fits into one shareable link
 */
export type WorkshopOverviewGraphState = {
    readonly visibleSeriesKeys: readonly WorkshopOverviewSeriesKey[];

    /**
     * One reaction the line counts, or `null` when it counts every reaction together
     */
    readonly reactionEmoji: string | null;

    /**
     * The shown span of time, where a bound which is `null` is the matching bound of the workshop itself
     */
    readonly zoomFromMilliseconds: number | null;
    readonly zoomToMilliseconds: number | null;

    readonly customMetrics: readonly WorkshopOverviewCustomMetric[];
};

/**
 * The graph a link without any query parameter opens: the audience, who joined, and the two things a room does most
 */
export const DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE: WorkshopOverviewGraphState = {
    visibleSeriesKeys: ['watchingParticipants', 'joinedParticipants', 'comments', 'reactions'],
    reactionEmoji: null,
    zoomFromMilliseconds: null,
    zoomToMilliseconds: null,
    customMetrics: [],
};

/**
 * The letter case is never significant, because a metric counts what was written rather than how it was capitalized.
 */
const CUSTOM_METRIC_REGULAR_EXPRESSION_FLAGS = 'i';

/**
 * Compile the expression of a custom metric, or say that it cannot be compiled at all
 *
 * Note: An expression is typed letter by letter, so an unfinished one is an ordinary state of the form rather than an
 *       error which should ever reach the user as a thrown exception.
 */
export function createWorkshopOverviewCustomMetricMatcher(pattern: string): RegExp | null {
    if (pattern.trim() === '') {
        return null;
    }

    try {
        return new RegExp(pattern, CUSTOM_METRIC_REGULAR_EXPRESSION_FLAGS);
    } catch {
        return null;
    }
}

/**
 * Keep only the metrics which can really draw a line, in the order and the number the graph has colours for
 */
export function normalizeWorkshopOverviewCustomMetrics(
    customMetrics: readonly WorkshopOverviewCustomMetric[],
): readonly WorkshopOverviewCustomMetric[] {
    return customMetrics
        .map((customMetric) => ({
            label: customMetric.label.trim() === '' ? customMetric.pattern.trim() : customMetric.label.trim(),
            pattern: customMetric.pattern.trim(),
        }))
        .filter((customMetric) => customMetric.pattern !== '')
        .slice(0, MAXIMAL_WORKSHOP_OVERVIEW_CUSTOM_METRIC_COUNT);
}

/**
 * Keep the shown lines in the order they are defined in and never twice, so that the same graph always writes the same
 * link
 */
function normalizeVisibleSeriesKeys(
    visibleSeriesKeys: readonly WorkshopOverviewSeriesKey[],
): readonly WorkshopOverviewSeriesKey[] {
    return WORKSHOP_OVERVIEW_SERIES_KEYS.filter((seriesKey) => visibleSeriesKeys.includes(seriesKey));
}

const SERIES_KEY_CODEC = createEnumeratedValueCodec(WORKSHOP_OVERVIEW_SERIES_KEYS);

/**
 * The shown lines, named one after another so that the link says in words what the graph draws
 *
 * Note: A graph without a single line is a valid, if empty, view, which an empty parameter carries.
 */
const VISIBLE_SERIES_KEYS_CODEC: UrlViewValueCodec<readonly WorkshopOverviewSeriesKey[]> = {
    parseValue: (parameterValue) =>
        normalizeVisibleSeriesKeys(
            parameterValue
                .split(',')
                .map((seriesName) => SERIES_KEY_CODEC.parseValue(seriesName))
                .filter((seriesKey): seriesKey is WorkshopOverviewSeriesKey => seriesKey !== null),
        ),
    serializeValue: (visibleSeriesKeys) => normalizeVisibleSeriesKeys(visibleSeriesKeys).join(','),
    areValuesEqual: (firstKeys, secondKeys) =>
        normalizeVisibleSeriesKeys(firstKeys).join(',') === normalizeVisibleSeriesKeys(secondKeys).join(','),
};

/**
 * One bound of the shown span, written as a readable moment in time rather than as a number of milliseconds
 */
const ZOOM_BOUND_CODEC: UrlViewValueCodec<number | null> = {
    parseValue: (parameterValue) => {
        const boundMilliseconds = Date.parse(parameterValue);
        return Number.isNaN(boundMilliseconds) ? null : boundMilliseconds;
    },
    serializeValue: (boundMilliseconds) =>
        boundMilliseconds === null ? '' : new Date(boundMilliseconds).toISOString(),
};

const REACTION_EMOJI_CODEC: UrlViewValueCodec<string | null> = {
    parseValue: (parameterValue) => (parameterValue.trim() === '' ? null : parameterValue.trim()),
    serializeValue: (reactionEmoji) => reactionEmoji ?? '',
};

/**
 * Is one parsed value a custom metric which the graph can draw?
 */
function isCustomMetricValue(value: unknown): value is WorkshopOverviewCustomMetric {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const { label, pattern } = value as Record<string, unknown>;
    return typeof pattern === 'string' && (label === undefined || typeof label === 'string');
}

/**
 * The metrics an administrator wrote, carried as JSON because a regular expression may contain any punctuation at all,
 * including whatever character a shorter notation would have to separate the values with
 */
const CUSTOM_METRICS_CODEC: UrlViewValueCodec<readonly WorkshopOverviewCustomMetric[]> = {
    parseValue: (parameterValue) => {
        let parsedValue: unknown;

        try {
            parsedValue = JSON.parse(parameterValue);
        } catch {
            return null;
        }

        if (!Array.isArray(parsedValue) || !parsedValue.every(isCustomMetricValue)) {
            return null;
        }

        return normalizeWorkshopOverviewCustomMetrics(
            parsedValue.map((customMetric) => ({
                label: customMetric.label ?? '',
                pattern: customMetric.pattern,
            })),
        );
    },
    serializeValue: (customMetrics) => JSON.stringify(normalizeWorkshopOverviewCustomMetrics(customMetrics)),
    areValuesEqual: (firstMetrics, secondMetrics) =>
        JSON.stringify(normalizeWorkshopOverviewCustomMetrics(firstMetrics)) ===
        JSON.stringify(normalizeWorkshopOverviewCustomMetrics(secondMetrics)),
};

function defineGraphParameter<TValue>(
    parameter: UrlViewParameter<WorkshopOverviewGraphState, TValue>,
): UrlViewParameter<WorkshopOverviewGraphState, unknown> {
    return defineUrlViewParameter<WorkshopOverviewGraphState, TValue>(parameter);
}

/**
 * Every value of the graph together with the query parameter which carries it
 */
export const WORKSHOP_OVERVIEW_GRAPH_PARAMETERS: readonly UrlViewParameter<WorkshopOverviewGraphState, unknown>[] = [
    defineGraphParameter<readonly WorkshopOverviewSeriesKey[]>({
        parameterName: 'series',
        readValue: (graphState) => graphState.visibleSeriesKeys,
        writeValue: (graphState, visibleSeriesKeys) => ({ ...graphState, visibleSeriesKeys }),
        ...VISIBLE_SERIES_KEYS_CODEC,
    }),
    defineGraphParameter<string | null>({
        parameterName: 'reaction',
        readValue: (graphState) => graphState.reactionEmoji,
        writeValue: (graphState, reactionEmoji) => ({ ...graphState, reactionEmoji }),
        ...REACTION_EMOJI_CODEC,
    }),
    defineGraphParameter<number | null>({
        parameterName: 'from',
        readValue: (graphState) => graphState.zoomFromMilliseconds,
        writeValue: (graphState, zoomFromMilliseconds) => ({ ...graphState, zoomFromMilliseconds }),
        ...ZOOM_BOUND_CODEC,
    }),
    defineGraphParameter<number | null>({
        parameterName: 'to',
        readValue: (graphState) => graphState.zoomToMilliseconds,
        writeValue: (graphState, zoomToMilliseconds) => ({ ...graphState, zoomToMilliseconds }),
        ...ZOOM_BOUND_CODEC,
    }),
    defineGraphParameter<readonly WorkshopOverviewCustomMetric[]>({
        parameterName: 'metrics',
        readValue: (graphState) => graphState.customMetrics,
        writeValue: (graphState, customMetrics) => ({ ...graphState, customMetrics }),
        ...CUSTOM_METRICS_CODEC,
    }),
];

export function parseWorkshopOverviewGraphState(searchParams: URLSearchParams): WorkshopOverviewGraphState {
    return parseUrlViewState(WORKSHOP_OVERVIEW_GRAPH_PARAMETERS, DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, searchParams);
}

export function serializeWorkshopOverviewGraphState(
    graphState: WorkshopOverviewGraphState,
    searchParams: URLSearchParams,
): URLSearchParams {
    return serializeUrlViewState(
        WORKSHOP_OVERVIEW_GRAPH_PARAMETERS,
        DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE,
        graphState,
        searchParams,
    );
}
