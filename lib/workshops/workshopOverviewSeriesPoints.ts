import {
    createWorkshopOverviewCustomMetricMatcher,
    normalizeWorkshopOverviewCustomMetrics,
    type WorkshopOverviewGraphState,
} from '@/lib/workshops/workshopOverviewGraphState';
import {
    getWorkshopOverviewCustomMetricColor,
    getWorkshopOverviewCustomMetricId,
    WORKSHOP_OVERVIEW_SERIES_DEFINITIONS,
    type WorkshopOverviewSeriesDescriptor,
    type WorkshopOverviewSeriesId,
} from '@/lib/workshops/workshopOverviewSeries';
import type { WorkshopAdminAnalytics, WorkshopAdminTimelinePoint } from '@/lib/workshops/workshopTypes';

/**
 * The moment every bucket of the timeline is aligned to
 *
 * Note: The database bins its buckets from this very moment, see `migrations/*.sql`. Keeping the same origin here is
 *       what lets a wider bucket of the graph contain whole buckets of the data instead of halves of two of them.
 */
const WORKSHOP_TIMELINE_BUCKET_ORIGIN_MILLISECONDS = Date.UTC(2000, 0, 1);

/**
 * How many points the graph draws at most, whatever span of time is shown
 *
 * Note: A room which has been open for months would otherwise ask a browser to draw a point per minute of them.
 */
export const MAXIMAL_WORKSHOP_OVERVIEW_POINT_COUNT = 480;

export type WorkshopOverviewSeriesPoint = {
    readonly startsAtMilliseconds: number;
    readonly values: Readonly<Record<WorkshopOverviewSeriesId, number>>;
};

export type WorkshopOverviewSeriesRange = {
    readonly fromMilliseconds: number;
    readonly toMilliseconds: number;
};

export type WorkshopOverviewSeries = {
    readonly points: readonly WorkshopOverviewSeriesPoint[];

    /**
     * How long one point of the graph lasts, which is a whole number of the buckets the data arrived in
     */
    readonly bucketDurationSeconds: number;
};

/**
 * The lines of the graph, named and coloured, in the fixed order which decides their colours
 *
 * Note: A reaction line says which reaction it counts, so a legend of a filtered graph never claims to count them all.
 */
export function getWorkshopOverviewSeriesDescriptors(
    graphState: WorkshopOverviewGraphState,
): readonly WorkshopOverviewSeriesDescriptor[] {
    const standardDescriptors = WORKSHOP_OVERVIEW_SERIES_DEFINITIONS.map((seriesDefinition) =>
        seriesDefinition.key === 'reactions' && graphState.reactionEmoji !== null
            ? { ...seriesDefinition, id: seriesDefinition.key, label: `Reakce ${graphState.reactionEmoji}` }
            : { ...seriesDefinition, id: seriesDefinition.key },
    );

    const customDescriptors = normalizeWorkshopOverviewCustomMetrics(graphState.customMetrics).map(
        (customMetric, customMetricIndex): WorkshopOverviewSeriesDescriptor => ({
            id: getWorkshopOverviewCustomMetricId(customMetricIndex),
            label: customMetric.label,
            description: `Zprávy odpovídající výrazu ${customMetric.pattern}`,
            color: getWorkshopOverviewCustomMetricColor(customMetricIndex),
            aggregationKind: 'sum',
        }),
    );

    return [...standardDescriptors, ...customDescriptors];
}

/**
 * The lines which are really drawn, which are the switched on ones and every custom metric which was written
 */
export function getVisibleWorkshopOverviewSeriesDescriptors(
    graphState: WorkshopOverviewGraphState,
): readonly WorkshopOverviewSeriesDescriptor[] {
    return getWorkshopOverviewSeriesDescriptors(graphState).filter(
        (descriptor) =>
            descriptor.id.startsWith('custom-') ||
            graphState.visibleSeriesKeys.some((seriesKey) => seriesKey === descriptor.id),
    );
}

/**
 * How long one point of the graph has to last, so that the shown span never asks for more points than can be drawn
 *
 * Note: The answer is always a whole number of data buckets, because a point which contained a part of a bucket could
 *       not say how much of it belongs to it.
 */
export function getWorkshopOverviewBucketDurationSeconds(
    range: WorkshopOverviewSeriesRange,
    dataBucketDurationSeconds: number,
    maximalPointCount: number = MAXIMAL_WORKSHOP_OVERVIEW_POINT_COUNT,
): number {
    const rangeSeconds = Math.max(1, (range.toMilliseconds - range.fromMilliseconds) / 1_000);
    const bucketMultiplier = Math.max(1, Math.ceil(rangeSeconds / (dataBucketDurationSeconds * maximalPointCount)));

    return dataBucketDurationSeconds * bucketMultiplier;
}

function alignToBucketStart(timestampMilliseconds: number, bucketDurationSeconds: number): number {
    const bucketDurationMilliseconds = bucketDurationSeconds * 1_000;
    const offsetMilliseconds = timestampMilliseconds - WORKSHOP_TIMELINE_BUCKET_ORIGIN_MILLISECONDS;

    return (
        WORKSHOP_TIMELINE_BUCKET_ORIGIN_MILLISECONDS +
        Math.floor(offsetMilliseconds / bucketDurationMilliseconds) * bucketDurationMilliseconds
    );
}

/**
 * How many times one reaction, or every reaction together, was sent in one bucket
 */
function getTimelinePointReactionCount(point: WorkshopAdminTimelinePoint, reactionEmoji: string | null): number {
    return reactionEmoji === null ? point.reactionCount : (point.reactionCountsByEmoji[reactionEmoji] ?? 0);
}

/**
 * Add one measured value into the bucket it belongs to, the way that kind of value is joined together
 */
function addSeriesValue(
    bucketValues: Map<number, Record<WorkshopOverviewSeriesId, number>>,
    bucketStartsAtMilliseconds: number,
    seriesId: WorkshopOverviewSeriesId,
    value: number,
    aggregationKind: 'sum' | 'maximum',
): void {
    const values = bucketValues.get(bucketStartsAtMilliseconds);
    if (values === undefined) {
        return;
    }

    values[seriesId] =
        aggregationKind === 'maximum' ? Math.max(values[seriesId] ?? 0, value) : (values[seriesId] ?? 0) + value;
}

/**
 * Turn the measured buckets into the points of one graph: as many points as the shown span needs, every line of every
 * point filled in, and the moments without any activity counted as nothing rather than left out
 */
export function buildWorkshopOverviewSeries(
    analytics: WorkshopAdminAnalytics,
    graphState: WorkshopOverviewGraphState,
    range: WorkshopOverviewSeriesRange,
    maximalPointCount: number = MAXIMAL_WORKSHOP_OVERVIEW_POINT_COUNT,
): WorkshopOverviewSeries {
    const dataBucketDurationSeconds = Math.max(1, analytics.bucketDurationSeconds);
    const bucketDurationSeconds = getWorkshopOverviewBucketDurationSeconds(
        range,
        dataBucketDurationSeconds,
        maximalPointCount,
    );
    const bucketDurationMilliseconds = bucketDurationSeconds * 1_000;
    const descriptors = getWorkshopOverviewSeriesDescriptors(graphState);
    const emptyValues = Object.fromEntries(descriptors.map((descriptor) => [descriptor.id, 0]));

    const firstBucketStartsAtMilliseconds = alignToBucketStart(range.fromMilliseconds, bucketDurationSeconds);
    const lastBucketStartsAtMilliseconds = alignToBucketStart(range.toMilliseconds, bucketDurationSeconds);
    const bucketValues = new Map<number, Record<WorkshopOverviewSeriesId, number>>();
    for (
        let bucketStartsAtMilliseconds = firstBucketStartsAtMilliseconds;
        bucketStartsAtMilliseconds <= lastBucketStartsAtMilliseconds;
        bucketStartsAtMilliseconds += bucketDurationMilliseconds
    ) {
        bucketValues.set(bucketStartsAtMilliseconds, { ...emptyValues });
    }

    for (const point of analytics.timeline) {
        const pointStartsAtMilliseconds = Date.parse(point.startsAt);
        if (Number.isNaN(pointStartsAtMilliseconds)) {
            continue;
        }

        const bucketStartsAtMilliseconds = alignToBucketStart(pointStartsAtMilliseconds, bucketDurationSeconds);
        const measuredValues: Readonly<Record<string, number>> = {
            watchingParticipants: point.watchingParticipantCount,
            joinedParticipants: point.participantCount,
            comments: point.commentCount,
            reactions: getTimelinePointReactionCount(point, graphState.reactionEmoji),
            upvotes: point.upvoteCount,
            linkClicks: point.linkClickCount,
        };

        for (const descriptor of WORKSHOP_OVERVIEW_SERIES_DEFINITIONS) {
            addSeriesValue(
                bucketValues,
                bucketStartsAtMilliseconds,
                descriptor.key,
                measuredValues[descriptor.key] ?? 0,
                descriptor.aggregationKind,
            );
        }
    }

    const customMetricMatchers = normalizeWorkshopOverviewCustomMetrics(graphState.customMetrics).map(
        (customMetric, customMetricIndex) => ({
            seriesId: getWorkshopOverviewCustomMetricId(customMetricIndex),
            matcher: createWorkshopOverviewCustomMetricMatcher(customMetric.pattern),
        }),
    );

    if (customMetricMatchers.length > 0) {
        for (const commentSample of analytics.commentSamples) {
            const occurredAtMilliseconds = Date.parse(commentSample.occurredAt);
            if (Number.isNaN(occurredAtMilliseconds)) {
                continue;
            }

            const bucketStartsAtMilliseconds = alignToBucketStart(occurredAtMilliseconds, bucketDurationSeconds);
            for (const { seriesId, matcher } of customMetricMatchers) {
                if (matcher !== null && matcher.test(commentSample.body)) {
                    addSeriesValue(bucketValues, bucketStartsAtMilliseconds, seriesId, 1, 'sum');
                }
            }
        }
    }

    return {
        bucketDurationSeconds,
        points: Array.from(bucketValues.entries())
            .sort(([firstStartsAt], [secondStartsAt]) => firstStartsAt - secondStartsAt)
            .map(([startsAtMilliseconds, values]) => ({ startsAtMilliseconds, values })),
    };
}

/**
 * How much of every line is in the shown span, which is the number written next to its name
 *
 * Note: A count of actions is added up over the span, while an audience is the highest number of people who watched at
 *       once, because nobody ever watched the sum of every minute of it.
 */
export function getWorkshopOverviewSeriesTotals(
    points: readonly WorkshopOverviewSeriesPoint[],
    descriptors: readonly WorkshopOverviewSeriesDescriptor[],
): Readonly<Record<WorkshopOverviewSeriesId, number>> {
    return Object.fromEntries(
        descriptors.map((descriptor) => [
            descriptor.id,
            points.reduce((total, point) => {
                const value = point.values[descriptor.id] ?? 0;
                return descriptor.aggregationKind === 'maximum' ? Math.max(total, value) : total + value;
            }, 0),
        ]),
    );
}

/**
 * The whole span the data covers, which is what zooming out shows: everything which happened before the workshop
 * started and everything which happened after it ended
 */
export function getWorkshopOverviewFullRange(analytics: WorkshopAdminAnalytics): WorkshopOverviewSeriesRange {
    // Note: Every message is counted in a bucket of the timeline as well, so the measured buckets already reach
    //       everything the sampled messages could, and the whole span is found without reading a single one of them.
    const bucketDurationMilliseconds = Math.max(1, analytics.bucketDurationSeconds) * 1_000;
    const measuredMilliseconds = [
        Date.parse(analytics.timelineStartsAt),
        Date.parse(analytics.timelineEndsAt),
        ...analytics.timeline.flatMap((point) => {
            const startsAtMilliseconds = Date.parse(point.startsAt);
            return [startsAtMilliseconds, startsAtMilliseconds + bucketDurationMilliseconds];
        }),
    ].filter((timestampMilliseconds) => !Number.isNaN(timestampMilliseconds));

    if (measuredMilliseconds.length === 0) {
        const nowMilliseconds = Date.now();
        return { fromMilliseconds: nowMilliseconds, toMilliseconds: nowMilliseconds };
    }

    return measuredMilliseconds.reduce<WorkshopOverviewSeriesRange>(
        (range, timestampMilliseconds) => ({
            fromMilliseconds: Math.min(range.fromMilliseconds, timestampMilliseconds),
            toMilliseconds: Math.max(range.toMilliseconds, timestampMilliseconds),
        }),
        { fromMilliseconds: Number.POSITIVE_INFINITY, toMilliseconds: Number.NEGATIVE_INFINITY },
    );
}

/**
 * The span the workshop itself was held in, which is what the graph opens with
 */
export function getWorkshopOverviewWorkshopRange(analytics: WorkshopAdminAnalytics): WorkshopOverviewSeriesRange {
    const startsAtMilliseconds = Date.parse(analytics.timelineStartsAt);
    const endsAtMilliseconds = Date.parse(analytics.timelineEndsAt);

    if (Number.isNaN(startsAtMilliseconds) || Number.isNaN(endsAtMilliseconds)) {
        return getWorkshopOverviewFullRange(analytics);
    }

    return {
        fromMilliseconds: startsAtMilliseconds,
        toMilliseconds: Math.max(endsAtMilliseconds, startsAtMilliseconds + 1_000),
    };
}

/**
 * The span the graph opens with: the time of the occurrence in a room which is held at one, and everything which was
 * ever measured in a room which is simply always open
 *
 * Note: A permanent room has a start only because a row needs one, and never an end, so opening it on a "time of the
 *       room" would draw months of emptiness with every message squeezed into the last pixel of it.
 */
export function getWorkshopOverviewDefaultRange(
    analytics: WorkshopAdminAnalytics,
    isRoomScheduled: boolean,
): WorkshopOverviewSeriesRange {
    return isRoomScheduled ? getWorkshopOverviewWorkshopRange(analytics) : getWorkshopOverviewFullRange(analytics);
}

/**
 * The span the graph shows: the one a shared link asks for, and the span the graph opens with wherever it does not
 *
 * Note: A bound is never allowed to leave the measured data behind, so a link which was shared before a workshop ran
 *       long still opens a graph with something in it.
 */
export function resolveWorkshopOverviewRange(
    defaultRange: WorkshopOverviewSeriesRange,
    graphState: WorkshopOverviewGraphState,
): WorkshopOverviewSeriesRange {
    const fromMilliseconds = graphState.zoomFromMilliseconds ?? defaultRange.fromMilliseconds;
    const toMilliseconds = graphState.zoomToMilliseconds ?? defaultRange.toMilliseconds;

    return toMilliseconds <= fromMilliseconds
        ? { fromMilliseconds, toMilliseconds: fromMilliseconds + 1_000 }
        : { fromMilliseconds, toMilliseconds };
}
