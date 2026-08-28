/**
 * The lines the overview graph of a workshop can draw, and how each of them looks
 *
 * Note: This is the single source of truth of a line. The graph, its legend, its tooltip, the toggles above it and
 *       every exported file read the identity, the name and the colour of a series from here, so a new metric is
 *       described exactly once.
 */

/**
 * How the values of one series are joined together when a bucket of the graph is wider than a bucket of the data
 *
 * A count of actions is added up, while an audience is a state rather than an action: two consecutive minutes of ten
 * people watching are ten people, never twenty, so the widest bucket keeps the highest audience it contains.
 */
export type WorkshopOverviewAggregationKind = 'sum' | 'maximum';

export const WORKSHOP_OVERVIEW_SERIES_KEYS = [
    'watchingParticipants',
    'activelyWatchingParticipants',
    'passivelyWatchingParticipants',
    'joinedParticipants',
    'comments',
    'reactions',
    'upvotes',
    'linkClicks',
] as const;

export type WorkshopOverviewSeriesKey = (typeof WORKSHOP_OVERVIEW_SERIES_KEYS)[number];

/**
 * The colours of the eight categorical slots, in the fixed order which keeps them apart for a colour blind reader
 *
 * Note: A slot belongs to one metric forever, so switching a line off never repaints the remaining ones. The order was
 *       validated against the white background of the administration, therefore the slots are never reordered, cycled
 *       or generated.
 */
const WORKSHOP_OVERVIEW_SERIES_COLORS = {
    blue: '#2a78d6',
    orange: '#eb6834',
    aqua: '#1baf7a',
    yellow: '#eda100',
    magenta: '#e87ba4',
    green: '#008300',
    violet: '#4a3aa7',
    red: '#e34948',
} as const;

/**
 * How many lines a reader can still tell apart, which is how many colour slots the validated palette has
 */
export const MAXIMAL_WORKSHOP_OVERVIEW_SERIES_COUNT = Object.keys(WORKSHOP_OVERVIEW_SERIES_COLORS).length;

/**
 * How a line is drawn where its colour alone would not tell it apart
 *
 * A colour belongs to one measured quantity, and the palette has as many colours as a reader can still tell apart, so
 * a line which only refines another one - the part of the audience which was really at their computer, and the part
 * which was not - shares the colour of the audience it is a part of and is told apart by its dashes instead of by a
 * ninth hue. The value is the dash pattern of an SVG stroke, and `null` is an unbroken line.
 */
export type WorkshopOverviewSeriesDashPattern = string | null;

export const WORKSHOP_OVERVIEW_ACTIVE_ATTENDANCE_DASH_PATTERN = '7 3';
export const WORKSHOP_OVERVIEW_PASSIVE_ATTENDANCE_DASH_PATTERN = '2 3';

export type WorkshopOverviewSeriesDefinition = {
    readonly key: WorkshopOverviewSeriesKey;
    readonly label: string;
    readonly description: string;
    readonly color: string;
    readonly dashPattern: WorkshopOverviewSeriesDashPattern;
    readonly aggregationKind: WorkshopOverviewAggregationKind;
};

export const WORKSHOP_OVERVIEW_SERIES_DEFINITIONS: readonly WorkshopOverviewSeriesDefinition[] = [
    {
        key: 'watchingParticipants',
        label: 'Diváci',
        description: 'Kolik lidí mělo místnost otevřenou',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.blue,
        dashPattern: null,
        aggregationKind: 'maximum',
    },
    {
        key: 'activelyWatchingParticipants',
        label: 'Aktivní diváci',
        description: 'Kolik z nich bylo opravdu u počítače – hýbali myší, psali nebo scrollovali',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.blue,
        dashPattern: WORKSHOP_OVERVIEW_ACTIVE_ATTENDANCE_DASH_PATTERN,
        aggregationKind: 'maximum',
    },
    {
        key: 'passivelyWatchingParticipants',
        label: 'Pasivní diváci',
        description: 'Kolik z nich mělo místnost jen puštěnou a pravděpodobně u ní nesedělo',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.blue,
        dashPattern: WORKSHOP_OVERVIEW_PASSIVE_ATTENDANCE_DASH_PATTERN,
        aggregationKind: 'maximum',
    },
    {
        key: 'joinedParticipants',
        label: 'Nově připojení',
        description: 'Kolik lidí se v tomto úseku registrovalo',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.green,
        dashPattern: null,
        aggregationKind: 'sum',
    },
    {
        key: 'comments',
        label: 'Komentáře',
        description: 'Kolik zpráv v tomto úseku přibylo',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.orange,
        dashPattern: null,
        aggregationKind: 'sum',
    },
    {
        key: 'reactions',
        label: 'Reakce',
        description: 'Kolik reakcí v tomto úseku přiletělo',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.aqua,
        dashPattern: null,
        aggregationKind: 'sum',
    },
    {
        key: 'upvotes',
        label: 'Hlasy',
        description: 'Kolik hlasů zprávy v tomto úseku dostaly',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.yellow,
        dashPattern: null,
        aggregationKind: 'sum',
    },
    {
        key: 'linkClicks',
        label: 'Kliknutí na materiály',
        description: 'Kolikrát někdo otevřel odkaz z materiálů',
        color: WORKSHOP_OVERVIEW_SERIES_COLORS.magenta,
        dashPattern: null,
        aggregationKind: 'sum',
    },
];

/**
 * The colour slots left for the metrics an administrator writes themselves
 *
 * Note: Their number is what limits how many custom metrics one graph may carry, because a ninth line would have to
 *       repeat a colour which already means something else.
 */
const WORKSHOP_OVERVIEW_CUSTOM_METRIC_COLORS: readonly string[] = [
    WORKSHOP_OVERVIEW_SERIES_COLORS.violet,
    WORKSHOP_OVERVIEW_SERIES_COLORS.red,
];

export const MAXIMAL_WORKSHOP_OVERVIEW_CUSTOM_METRIC_COUNT = WORKSHOP_OVERVIEW_CUSTOM_METRIC_COLORS.length;

/**
 * The name under which one line is plotted, exported and written into a shared link
 */
export type WorkshopOverviewSeriesId = string;

/**
 * Everything the graph needs to draw one line, whichever kind of metric it is
 */
export type WorkshopOverviewSeriesDescriptor = {
    readonly id: WorkshopOverviewSeriesId;
    readonly label: string;
    readonly description: string;
    readonly color: string;
    readonly dashPattern: WorkshopOverviewSeriesDashPattern;
    readonly aggregationKind: WorkshopOverviewAggregationKind;
};

/**
 * The identity of the custom metric which sits at the given place of the list
 *
 * Note: A custom metric is named by its position, so a link which was shared keeps drawing the same colour for the
 *       same metric.
 */
export function getWorkshopOverviewCustomMetricId(customMetricIndex: number): WorkshopOverviewSeriesId {
    return `custom-${customMetricIndex + 1}`;
}

export function getWorkshopOverviewCustomMetricColor(customMetricIndex: number): string {
    return WORKSHOP_OVERVIEW_CUSTOM_METRIC_COLORS[customMetricIndex] ?? WORKSHOP_OVERVIEW_SERIES_COLORS.violet;
}
