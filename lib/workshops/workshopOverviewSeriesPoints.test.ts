import { describe, expect, it } from 'vitest';
import { serializeWorkshopOverviewSeriesAsCsv } from './workshopOverviewCsv';
import { DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, type WorkshopOverviewGraphState } from './workshopOverviewGraphState';
import {
    buildWorkshopOverviewSeries,
    getVisibleWorkshopOverviewSeriesDescriptors,
    getWorkshopOverviewBucketDurationSeconds,
    getWorkshopOverviewFullRange,
    getWorkshopOverviewSeriesTotals,
    resolveWorkshopOverviewRange,
} from './workshopOverviewSeriesPoints';
import type { WorkshopAdminAnalytics, WorkshopAdminTimelinePoint } from './workshopTypes';

const WORKSHOP_STARTS_AT = '2026-08-23T10:00:00.000Z';
const WORKSHOP_ENDS_AT = '2026-08-23T11:00:00.000Z';

function createTimelinePoint(
    startsAt: string,
    values: Partial<WorkshopAdminTimelinePoint> = {},
): WorkshopAdminTimelinePoint {
    return {
        startsAt,
        watchingParticipantCount: 0,
        participantCount: 0,
        commentCount: 0,
        reactionCount: 0,
        upvoteCount: 0,
        linkClickCount: 0,
        reactionCountsByEmoji: {},
        ...values,
    };
}

function createAnalytics(timeline: readonly WorkshopAdminTimelinePoint[]): WorkshopAdminAnalytics {
    return {
        timelineStartsAt: WORKSHOP_STARTS_AT,
        timelineEndsAt: WORKSHOP_ENDS_AT,
        bucketDurationSeconds: 60,
        timeline,
        reactionCounts: [],
        commentSamples: [],
        isCommentSampleComplete: true,
    };
}

const WORKSHOP_RANGE = {
    fromMilliseconds: Date.parse(WORKSHOP_STARTS_AT),
    toMilliseconds: Date.parse(WORKSHOP_ENDS_AT),
};

describe('resolveWorkshopOverviewRange', () => {
    it('opens the time of the workshop itself', () => {
        expect(resolveWorkshopOverviewRange(createAnalytics([]), DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE)).toEqual(
            WORKSHOP_RANGE,
        );
    });

    it('opens the span a shared link asks for', () => {
        const graphState: WorkshopOverviewGraphState = {
            ...DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE,
            zoomFromMilliseconds: Date.parse('2026-08-23T10:15:00.000Z'),
            zoomToMilliseconds: Date.parse('2026-08-23T10:30:00.000Z'),
        };

        expect(resolveWorkshopOverviewRange(createAnalytics([]), graphState)).toEqual({
            fromMilliseconds: Date.parse('2026-08-23T10:15:00.000Z'),
            toMilliseconds: Date.parse('2026-08-23T10:30:00.000Z'),
        });
    });
});

describe('getWorkshopOverviewFullRange', () => {
    it('reaches everything which happened before the workshop started and after it ended', () => {
        const analytics = createAnalytics([
            createTimelinePoint('2026-08-20T08:00:00.000Z', { participantCount: 3 }),
            createTimelinePoint('2026-08-24T09:00:00.000Z', { reactionCount: 1 }),
        ]);

        const fullRange = getWorkshopOverviewFullRange(analytics);

        expect(fullRange.fromMilliseconds).toBe(Date.parse('2026-08-20T08:00:00.000Z'));
        expect(fullRange.toMilliseconds).toBe(Date.parse('2026-08-24T09:01:00.000Z'));
    });
});

describe('getWorkshopOverviewBucketDurationSeconds', () => {
    it('draws one point per measured bucket while they all fit', () => {
        expect(getWorkshopOverviewBucketDurationSeconds(WORKSHOP_RANGE, 60, 480)).toBe(60);
    });

    it('joins whole buckets together when the shown span has more of them than can be drawn', () => {
        const weekRange = {
            fromMilliseconds: Date.parse('2026-08-17T00:00:00.000Z'),
            toMilliseconds: Date.parse('2026-08-24T00:00:00.000Z'),
        };

        const bucketDurationSeconds = getWorkshopOverviewBucketDurationSeconds(weekRange, 60, 480);

        expect(bucketDurationSeconds % 60).toBe(0);
        expect(
            (weekRange.toMilliseconds - weekRange.fromMilliseconds) / 1_000 / bucketDurationSeconds,
        ).toBeLessThanOrEqual(480);
    });
});

describe('buildWorkshopOverviewSeries', () => {
    it('counts every measured bucket, and the quiet moments between them as nothing', () => {
        const analytics = createAnalytics([
            createTimelinePoint('2026-08-23T10:00:00.000Z', { watchingParticipantCount: 4, commentCount: 2 }),
            createTimelinePoint('2026-08-23T10:02:00.000Z', { watchingParticipantCount: 6, commentCount: 1 }),
        ]);

        const { points } = buildWorkshopOverviewSeries(analytics, DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, {
            fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
            toMilliseconds: Date.parse('2026-08-23T10:03:00.000Z'),
        });

        expect(points.map((point) => point.values.comments)).toEqual([2, 0, 1, 0]);
        expect(points.map((point) => point.values.watchingParticipants)).toEqual([4, 0, 6, 0]);
    });

    it('adds actions up but keeps the highest audience when buckets are joined together', () => {
        const analytics = createAnalytics([
            createTimelinePoint('2026-08-23T10:00:00.000Z', { watchingParticipantCount: 10, commentCount: 2 }),
            createTimelinePoint('2026-08-23T10:01:00.000Z', { watchingParticipantCount: 12, commentCount: 3 }),
        ]);

        const { points, bucketDurationSeconds } = buildWorkshopOverviewSeries(
            analytics,
            DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE,
            {
                fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
                toMilliseconds: Date.parse('2026-08-23T10:01:30.000Z'),
            },
            1,
        );

        expect(bucketDurationSeconds).toBe(120);
        expect(points[0]?.values.comments).toBe(5);
        expect(points[0]?.values.watchingParticipants).toBe(12);
    });

    it('counts one chosen reaction instead of all of them', () => {
        const analytics = createAnalytics([
            createTimelinePoint('2026-08-23T10:00:00.000Z', {
                reactionCount: 5,
                reactionCountsByEmoji: { '👍': 3, '🔥': 2 },
            }),
        ]);
        const range = {
            fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
            toMilliseconds: Date.parse('2026-08-23T10:00:30.000Z'),
        };

        const allReactions = buildWorkshopOverviewSeries(analytics, DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, range);
        const oneReaction = buildWorkshopOverviewSeries(
            analytics,
            { ...DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, reactionEmoji: '👍' },
            range,
        );

        expect(allReactions.points[0]?.values.reactions).toBe(5);
        expect(oneReaction.points[0]?.values.reactions).toBe(3);
    });

    it('counts the messages which match a metric an administrator wrote', () => {
        const analytics: WorkshopAdminAnalytics = {
            ...createAnalytics([createTimelinePoint('2026-08-23T10:00:00.000Z', { commentCount: 3 })]),
            commentSamples: [
                { occurredAt: '2026-08-23T10:00:10.000Z', body: 'Potřebuji pomoc s agentem' },
                { occurredAt: '2026-08-23T10:00:20.000Z', body: 'HELP prosím' },
                { occurredAt: '2026-08-23T10:00:30.000Z', body: 'Díky, jasné' },
            ],
        };

        const { points } = buildWorkshopOverviewSeries(
            analytics,
            { ...DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, customMetrics: [{ label: 'Pomoc', pattern: 'pomoc|help' }] },
            {
                fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
                toMilliseconds: Date.parse('2026-08-23T10:00:30.000Z'),
            },
        );

        expect(points[0]?.values['custom-1']).toBe(2);
    });

    it('draws no line at all for an expression which cannot be understood', () => {
        const analytics: WorkshopAdminAnalytics = {
            ...createAnalytics([createTimelinePoint('2026-08-23T10:00:00.000Z')]),
            commentSamples: [{ occurredAt: '2026-08-23T10:00:10.000Z', body: 'cokoliv' }],
        };

        const { points } = buildWorkshopOverviewSeries(
            analytics,
            { ...DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, customMetrics: [{ label: 'Rozbité', pattern: '([' }] },
            {
                fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
                toMilliseconds: Date.parse('2026-08-23T10:00:30.000Z'),
            },
        );

        expect(points[0]?.values['custom-1']).toBe(0);
    });
});

describe('getWorkshopOverviewSeriesTotals', () => {
    it('says how much of a line is in the shown span, and the highest audience of it', () => {
        const analytics = createAnalytics([
            createTimelinePoint('2026-08-23T10:00:00.000Z', { watchingParticipantCount: 8, commentCount: 2 }),
            createTimelinePoint('2026-08-23T10:01:00.000Z', { watchingParticipantCount: 5, commentCount: 4 }),
        ]);
        const range = {
            fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
            toMilliseconds: Date.parse('2026-08-23T10:01:30.000Z'),
        };
        const { points } = buildWorkshopOverviewSeries(analytics, DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE, range);
        const descriptors = getVisibleWorkshopOverviewSeriesDescriptors(DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE);

        const totals = getWorkshopOverviewSeriesTotals(points, descriptors);

        expect(totals.comments).toBe(6);
        expect(totals.watchingParticipants).toBe(8);
    });
});

describe('serializeWorkshopOverviewSeriesAsCsv', () => {
    it('writes one column per drawn line and one row per point of the graph', () => {
        const analytics = createAnalytics([
            createTimelinePoint('2026-08-23T10:00:00.000Z', { watchingParticipantCount: 7, commentCount: 1 }),
        ]);
        const range = {
            fromMilliseconds: Date.parse('2026-08-23T10:00:00.000Z'),
            toMilliseconds: Date.parse('2026-08-23T10:00:30.000Z'),
        };
        const graphState: WorkshopOverviewGraphState = {
            ...DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE,
            visibleSeriesKeys: ['watchingParticipants', 'comments'],
        };
        const { points } = buildWorkshopOverviewSeries(analytics, graphState, range);

        const csv = serializeWorkshopOverviewSeriesAsCsv(
            points,
            getVisibleWorkshopOverviewSeriesDescriptors(graphState),
        );

        expect(csv).toContain('"Začátek úseku","Diváci","Komentáře"');
        expect(csv).toContain('"2026-08-23T10:00:00.000Z","7","1"');
    });
});
