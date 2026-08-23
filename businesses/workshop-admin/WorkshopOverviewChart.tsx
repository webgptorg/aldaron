'use client';

import {
    formatWorkshopOverviewAxisTime,
    formatWorkshopOverviewPointTime,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import type { WorkshopOverviewSeriesDescriptor } from '@/lib/workshops/workshopOverviewSeries';
import type {
    WorkshopOverviewSeriesPoint,
    WorkshopOverviewSeriesRange,
} from '@/lib/workshops/workshopOverviewSeriesPoints';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    type TooltipProps,
} from 'recharts';

/**
 * The recessive chrome of the chart, one shade off the surface it is drawn on
 */
const CHART_GRID_COLOR = '#e1e0d9';
const CHART_AXIS_COLOR = '#c3c2b7';
const CHART_LABEL_COLOR = '#898781';

const CHART_HEIGHT_PIXELS = 340;

/**
 * How much of the shown span one turn of the wheel takes away, or gives back
 */
const WHEEL_ZOOM_FACTOR = 0.2;

/**
 * The shortest span the graph can be zoomed into, so that a wheel under an impatient hand never reaches one moment
 */
const MINIMAL_ZOOM_RANGE_MILLISECONDS = 60_000;

type WorkshopOverviewChartProps = {
    readonly points: readonly WorkshopOverviewSeriesPoint[];
    readonly descriptors: readonly WorkshopOverviewSeriesDescriptor[];
    readonly range: WorkshopOverviewSeriesRange;

    /**
     * The whole span the data covers, which no zoom ever leaves
     */
    readonly fullRange: WorkshopOverviewSeriesRange;

    readonly onZoomChange: (range: WorkshopOverviewSeriesRange) => void;

    /**
     * Where the drawn chart is kept, so that a picture of it can be taken from outside
     */
    readonly containerReference: RefObject<HTMLDivElement | null>;
};

/**
 * The drawn chart inside its container, or nothing at all while it is still measuring itself against the page
 *
 * Note: The picture is looked for at the moment it is asked for rather than remembered when the chart appears, because
 *       a chart which sizes itself draws itself only after it has been measured, which its container never notices.
 */
export function findChartPicture(containerElement: HTMLElement | null): SVGSVGElement | null {
    return (containerElement?.querySelector('svg') as SVGSVGElement | null) ?? null;
}

type ChartRow = Record<string, number>;

/**
 * Recharts reads every line out of one flat row, so the values of one moment are handed over next to its time
 */
function buildChartRows(points: readonly WorkshopOverviewSeriesPoint[]): readonly ChartRow[] {
    return points.map((point) => ({ startsAtMilliseconds: point.startsAtMilliseconds, ...point.values }));
}

function clampRangeToFullRange(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
): WorkshopOverviewSeriesRange {
    const fromMilliseconds = Math.max(fullRange.fromMilliseconds, Math.round(range.fromMilliseconds));
    const toMilliseconds = Math.min(fullRange.toMilliseconds, Math.round(range.toMilliseconds));

    return toMilliseconds - fromMilliseconds < MINIMAL_ZOOM_RANGE_MILLISECONDS
        ? { fromMilliseconds, toMilliseconds: fromMilliseconds + MINIMAL_ZOOM_RANGE_MILLISECONDS }
        : { fromMilliseconds, toMilliseconds };
}

/**
 * One readout of every line at the moment the pointer found, where the number leads and the name of the line follows
 */
function WorkshopOverviewTooltip({
    active,
    label,
    payload,
    descriptors,
}: TooltipProps<number, string> & { readonly descriptors: readonly WorkshopOverviewSeriesDescriptor[] }) {
    const chartRow = payload?.[0]?.payload as ChartRow | undefined;

    if (active !== true || chartRow === undefined) {
        return null;
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
            <p className="text-xs font-medium text-slate-500">
                {formatWorkshopOverviewPointTime(Number(label ?? chartRow.startsAtMilliseconds))}
            </p>
            <ul className="mt-1.5 space-y-1">
                {descriptors.map((descriptor) => (
                    <li key={descriptor.id} className="flex items-center gap-2 text-sm">
                        <span
                            aria-hidden="true"
                            className="h-0.5 w-3.5 shrink-0 rounded-full"
                            style={{ backgroundColor: descriptor.color }}
                        />
                        <span className="font-bold tabular-nums text-slate-950">{chartRow[descriptor.id] ?? 0}</span>
                        <span className="text-xs text-slate-500">{descriptor.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * The audience and the activity of a room across the time it was open, zoomable by dragging over it or by the wheel
 *
 * Note: The chart is never remounted and never animates between two answers of the server, so data which arrived while
 *       somebody was reading it slides in instead of blinking.
 */
export function WorkshopOverviewChart({
    points,
    descriptors,
    range,
    fullRange,
    onZoomChange,
    containerReference,
}: WorkshopOverviewChartProps) {
    const [selectionFromMilliseconds, setSelectionFromMilliseconds] = useState<number | null>(null);
    const [selectionToMilliseconds, setSelectionToMilliseconds] = useState<number | null>(null);

    // Note: A wheel over the chart zooms it instead of scrolling the page away, which the browser only allows to be
    //       said by a listener registered as one which may refuse the scroll.
    useEffect(() => {
        const containerElement = containerReference.current;
        if (containerElement === null) {
            return;
        }

        const handleWheel = (wheelEvent: WheelEvent) => {
            wheelEvent.preventDefault();

            const containerBounds = containerElement.getBoundingClientRect();
            const pointerFraction =
                containerBounds.width === 0
                    ? 0.5
                    : Math.min(1, Math.max(0, (wheelEvent.clientX - containerBounds.left) / containerBounds.width));
            const rangeMilliseconds = range.toMilliseconds - range.fromMilliseconds;
            const zoomedRangeMilliseconds =
                wheelEvent.deltaY > 0
                    ? rangeMilliseconds * (1 + WHEEL_ZOOM_FACTOR)
                    : rangeMilliseconds * (1 - WHEEL_ZOOM_FACTOR);
            const pointerMilliseconds = range.fromMilliseconds + rangeMilliseconds * pointerFraction;

            onZoomChange(
                clampRangeToFullRange(
                    {
                        fromMilliseconds: pointerMilliseconds - zoomedRangeMilliseconds * pointerFraction,
                        toMilliseconds: pointerMilliseconds + zoomedRangeMilliseconds * (1 - pointerFraction),
                    },
                    fullRange,
                ),
            );
        };

        containerElement.addEventListener('wheel', handleWheel, { passive: false });
        return () => containerElement.removeEventListener('wheel', handleWheel);
    }, [containerReference, fullRange, onZoomChange, range.fromMilliseconds, range.toMilliseconds]);

    const finishSelection = useCallback(() => {
        if (
            selectionFromMilliseconds !== null &&
            selectionToMilliseconds !== null &&
            selectionFromMilliseconds !== selectionToMilliseconds
        ) {
            onZoomChange(
                clampRangeToFullRange(
                    {
                        fromMilliseconds: Math.min(selectionFromMilliseconds, selectionToMilliseconds),
                        toMilliseconds: Math.max(selectionFromMilliseconds, selectionToMilliseconds),
                    },
                    fullRange,
                ),
            );
        }

        setSelectionFromMilliseconds(null);
        setSelectionToMilliseconds(null);
    }, [fullRange, onZoomChange, selectionFromMilliseconds, selectionToMilliseconds]);

    const rangeMilliseconds = range.toMilliseconds - range.fromMilliseconds;

    return (
        <div ref={containerReference} className="mt-4 select-none">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT_PIXELS}>
                <LineChart
                    data={buildChartRows(points) as ChartRow[]}
                    margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
                    onMouseDown={(chartState) =>
                        setSelectionFromMilliseconds(
                            chartState?.activeLabel === undefined ? null : Number(chartState.activeLabel),
                        )
                    }
                    onMouseMove={(chartState) => {
                        if (selectionFromMilliseconds !== null && chartState?.activeLabel !== undefined) {
                            setSelectionToMilliseconds(Number(chartState.activeLabel));
                        }
                    }}
                    onMouseUp={finishSelection}
                    onMouseLeave={finishSelection}
                >
                    <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                    <XAxis
                        dataKey="startsAtMilliseconds"
                        type="number"
                        scale="time"
                        domain={[range.fromMilliseconds, range.toMilliseconds]}
                        allowDataOverflow
                        stroke={CHART_AXIS_COLOR}
                        tick={{ fill: CHART_LABEL_COLOR, fontSize: 11 }}
                        tickFormatter={(timestampMilliseconds: number) =>
                            formatWorkshopOverviewAxisTime(timestampMilliseconds, rangeMilliseconds)
                        }
                        // Note: Both ends of the shown span are always named, so a reader knows what they zoomed into
                        //       without reading it above the chart.
                        interval="preserveStartEnd"
                        minTickGap={48}
                    />
                    <YAxis
                        allowDecimals={false}
                        width={44}
                        tickCount={6}
                        stroke={CHART_AXIS_COLOR}
                        tick={{ fill: CHART_LABEL_COLOR, fontSize: 11 }}
                    />
                    <Tooltip
                        content={<WorkshopOverviewTooltip descriptors={descriptors} />}
                        cursor={{ stroke: CHART_LABEL_COLOR, strokeWidth: 1 }}
                        isAnimationActive={false}
                    />
                    {descriptors.map((descriptor) => (
                        <Line
                            key={descriptor.id}
                            type="monotone"
                            dataKey={descriptor.id}
                            name={descriptor.label}
                            stroke={descriptor.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                            isAnimationActive={false}
                        />
                    ))}
                    {selectionFromMilliseconds !== null && selectionToMilliseconds !== null && (
                        <ReferenceArea
                            x1={selectionFromMilliseconds}
                            x2={selectionToMilliseconds}
                            fill={CHART_LABEL_COLOR}
                            fillOpacity={0.15}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
