/**
 * @vitest-environment jsdom
 */

import {
    findChartPicture,
    getWorkshopOverviewMidnightTimestamps,
    WorkshopOverviewChart,
} from '@/businesses/workshop-admin/WorkshopOverviewChart';
import { DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE } from '@/lib/workshops/workshopOverviewGraphState';
import {
    getVisibleWorkshopOverviewSeriesDescriptors,
    type WorkshopOverviewSeriesPoint,
    type WorkshopOverviewSeriesRange,
} from '@/lib/workshops/workshopOverviewSeriesPoints';
import { cleanup, render } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const FIRST_MINUTE_MILLISECONDS = Date.parse('2026-08-23T10:00:00.000Z');

function createChartPoint(startsAtMilliseconds: number, valueIndex: number = 0): WorkshopOverviewSeriesPoint {
    return {
        startsAtMilliseconds,
        values: {
            watchingParticipants: 10 + valueIndex,
            activelyWatchingParticipants: 6 + valueIndex,
            passivelyWatchingParticipants: 4,
            joinedParticipants: valueIndex,
            comments: valueIndex * 2,
            reactions: 1,
            upvotes: 0,
            linkClicks: 0,
        },
    };
}

const CHART_POINTS: readonly WorkshopOverviewSeriesPoint[] = [0, 1, 2, 3].map((minuteIndex) =>
    createChartPoint(FIRST_MINUTE_MILLISECONDS + minuteIndex * 60_000, minuteIndex),
);

const CHART_RANGE = {
    fromMilliseconds: FIRST_MINUTE_MILLISECONDS,
    toMilliseconds: FIRST_MINUTE_MILLISECONDS + 3 * 60_000,
};

const CHART_WIDTH_PIXELS = 900;
const CHART_HEIGHT_PIXELS = 340;

const FIRST_LOCAL_MIDNIGHT_MILLISECONDS = new Date(2026, 7, 24).getTime();
const SECOND_LOCAL_MIDNIGHT_MILLISECONDS = new Date(2026, 7, 25).getTime();
const DAY_MARKER_RANGE: WorkshopOverviewSeriesRange = {
    fromMilliseconds: FIRST_LOCAL_MIDNIGHT_MILLISECONDS - 30 * 60_000,
    toMilliseconds: SECOND_LOCAL_MIDNIGHT_MILLISECONDS + 30 * 60_000,
};

/**
 * A chart measures itself against the page it is drawn on, which a test page never lays out, so the measurement is
 * answered with a size of its own right away
 */
class ImmediateResizeObserver implements ResizeObserver {
    constructor(private readonly reportSize: ResizeObserverCallback) {}

    observe(target: Element): void {
        this.reportSize(
            [
                {
                    target,
                    contentRect: { width: CHART_WIDTH_PIXELS, height: CHART_HEIGHT_PIXELS },
                } as ResizeObserverEntry,
            ],
            this,
        );
    }

    unobserve(): void {}
    disconnect(): void {}
}

type RenderChartOptions = {
    readonly containerReference?: RefObject<HTMLDivElement | null>;
    readonly points?: readonly WorkshopOverviewSeriesPoint[];
    readonly range?: WorkshopOverviewSeriesRange;
    readonly fullRange?: WorkshopOverviewSeriesRange;
    readonly workshopRange?: WorkshopOverviewSeriesRange | null;
};

function renderChart({
    containerReference = createRef<HTMLDivElement>(),
    points = CHART_POINTS,
    range = CHART_RANGE,
    fullRange = range,
    workshopRange = null,
}: RenderChartOptions = {}) {
    globalThis.ResizeObserver = ImmediateResizeObserver;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(CHART_WIDTH_PIXELS);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(CHART_HEIGHT_PIXELS);

    return render(
        <WorkshopOverviewChart
            points={points}
            descriptors={getVisibleWorkshopOverviewSeriesDescriptors(DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE)}
            range={range}
            fullRange={fullRange}
            workshopRange={workshopRange}
            onZoomChange={vi.fn()}
            containerReference={containerReference}
        />,
    );
}

describe('WorkshopOverviewChart', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('draws one line for every switched on series, in the colour that series always has', () => {
        const { container } = renderChart();

        const drawnLines = Array.from(container.querySelectorAll('path.recharts-line-curve'));
        const drawnColors = drawnLines.map((line) => line.getAttribute('stroke'));

        expect(drawnLines).toHaveLength(5);
        expect(drawnColors).toEqual(['#2a78d6', '#2a78d6', '#008300', '#eb6834', '#1baf7a']);
    });

    // Note: The attendance of an audience is a part of that very audience, so it shares its colour instead of taking a
    //       hue of its own. The dashes are then the only thing which tells the two lines apart.
    it('tells the attendance of an audience apart from the audience itself by its dashes', () => {
        const { container } = renderChart();

        const drawnDashPatterns = Array.from(container.querySelectorAll('path.recharts-line-curve')).map((line) =>
            line.getAttribute('stroke-dasharray'),
        );

        expect(drawnDashPatterns[0]).toBeNull();
        expect(drawnDashPatterns[1]).toBe('7 3');
    });

    it('really plots the measured values, so that a line is never silently empty or flat', () => {
        const { container } = renderChart();

        const audienceCurve = container.querySelector('path.recharts-line-curve')?.getAttribute('d') ?? '';
        const drawnHeights = Array.from(audienceCurve.matchAll(/(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g)).map((coordinates) =>
            Number(coordinates[2]),
        );

        expect(audienceCurve).toMatch(/^M[\d.,]+C/);
        expect(audienceCurve.split('C')).toHaveLength(CHART_POINTS.length);

        // Note: A growing audience is drawn upwards, which in a picture means towards a smaller distance from its top
        expect(drawnHeights[0]).toBeGreaterThan(drawnHeights[drawnHeights.length - 1] ?? 0);
    });

    it('keeps the drawn picture findable, so that it can be exported', () => {
        const containerReference = createRef<HTMLDivElement>();

        const { container } = renderChart({ containerReference });

        expect(container.querySelector('svg')).not.toBeNull();
        expect(findChartPicture(containerReference.current) === container.querySelector('svg')).toBe(true);
    });

    it('names the moments of an hour long workshop by the clock', () => {
        const { container } = renderChart();

        const axisLabels = Array.from(container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick-value'))
            .map((tick) => tick.textContent)
            .filter((label): label is string => label !== null && label !== '');

        expect(axisLabels.length).toBeGreaterThan(0);
        axisLabels.forEach((axisLabel) => expect(axisLabel).toMatch(/^\d{1,2}:\d{2}$/));
    });

    it('marks every local midnight inside the shown time span', () => {
        expect(getWorkshopOverviewMidnightTimestamps(DAY_MARKER_RANGE)).toEqual([
            FIRST_LOCAL_MIDNIGHT_MILLISECONDS,
            SECOND_LOCAL_MIDNIGHT_MILLISECONDS,
        ]);

        const { container } = renderChart({
            points: [
                createChartPoint(DAY_MARKER_RANGE.fromMilliseconds),
                createChartPoint(DAY_MARKER_RANGE.toMilliseconds, 1),
            ],
            range: DAY_MARKER_RANGE,
        });

        const dayMarkers = container.querySelectorAll('.workshop-overview-midnight');
        expect(dayMarkers).toHaveLength(2);
        dayMarkers.forEach((dayMarker) =>
            expect(dayMarker.querySelector('.recharts-reference-line-line')?.getAttribute('stroke-dasharray')).toBe('3 3'),
        );
    });

    it('draws a subtle background band for the visible workshop time', () => {
        const { container } = renderChart({
            workshopRange: {
                fromMilliseconds: CHART_RANGE.fromMilliseconds + 60_000,
                toMilliseconds: CHART_RANGE.toMilliseconds - 60_000,
            },
        });

        const workshopBand = container.querySelector(
            '.workshop-overview-workshop-range .recharts-reference-area-rect',
        );
        expect(workshopBand).not.toBeNull();
        expect(workshopBand?.getAttribute('fill')).toBe('#06b6d4');
        expect(workshopBand?.getAttribute('fill-opacity')).toBe('0.12');
    });
});
