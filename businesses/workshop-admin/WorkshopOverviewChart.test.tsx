/**
 * @vitest-environment jsdom
 */

import { findChartPicture, WorkshopOverviewChart } from '@/businesses/workshop-admin/WorkshopOverviewChart';
import { DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE } from '@/lib/workshops/workshopOverviewGraphState';
import {
    getVisibleWorkshopOverviewSeriesDescriptors,
    type WorkshopOverviewSeriesPoint,
} from '@/lib/workshops/workshopOverviewSeriesPoints';
import { cleanup, render } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const FIRST_MINUTE_MILLISECONDS = Date.parse('2026-08-23T10:00:00.000Z');

const CHART_POINTS: readonly WorkshopOverviewSeriesPoint[] = [0, 1, 2, 3].map((minuteIndex) => ({
    startsAtMilliseconds: FIRST_MINUTE_MILLISECONDS + minuteIndex * 60_000,
    values: {
        watchingParticipants: 10 + minuteIndex,
        joinedParticipants: minuteIndex,
        comments: minuteIndex * 2,
        reactions: 1,
        upvotes: 0,
        linkClicks: 0,
    },
}));

const CHART_RANGE = {
    fromMilliseconds: FIRST_MINUTE_MILLISECONDS,
    toMilliseconds: FIRST_MINUTE_MILLISECONDS + 3 * 60_000,
};

const CHART_WIDTH_PIXELS = 900;
const CHART_HEIGHT_PIXELS = 340;

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

function renderChart(containerReference: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>()) {
    globalThis.ResizeObserver = ImmediateResizeObserver;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(CHART_WIDTH_PIXELS);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(CHART_HEIGHT_PIXELS);

    return render(
        <WorkshopOverviewChart
            points={CHART_POINTS}
            descriptors={getVisibleWorkshopOverviewSeriesDescriptors(DEFAULT_WORKSHOP_OVERVIEW_GRAPH_STATE)}
            range={CHART_RANGE}
            fullRange={CHART_RANGE}
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

        expect(drawnLines).toHaveLength(4);
        expect(drawnColors).toEqual(['#2a78d6', '#008300', '#eb6834', '#1baf7a']);
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

        const { container } = renderChart(containerReference);

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
});
