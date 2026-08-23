'use client';

import { useWorkshopAdminAnalytics } from '@/businesses/workshop-admin/useWorkshopAdminAnalytics';
import { findChartPicture, WorkshopOverviewChart } from '@/businesses/workshop-admin/WorkshopOverviewChart';
import { WorkshopOverviewChartControls } from '@/businesses/workshop-admin/WorkshopOverviewChartControls';
import { WorkshopOverviewCustomMetricEditor } from '@/businesses/workshop-admin/WorkshopOverviewCustomMetricEditor';
import { WorkshopOverviewExportButtons } from '@/businesses/workshop-admin/WorkshopOverviewExportButtons';
import type {
    WorkshopOverviewCustomMetric,
    WorkshopOverviewGraphState,
} from '@/lib/workshops/workshopOverviewGraphState';
import type { WorkshopOverviewSeriesKey } from '@/lib/workshops/workshopOverviewSeries';
import {
    buildWorkshopOverviewSeries,
    getVisibleWorkshopOverviewSeriesDescriptors,
    getWorkshopOverviewFullRange,
    getWorkshopOverviewSeriesDescriptors,
    getWorkshopOverviewSeriesTotals,
    getWorkshopOverviewWorkshopRange,
    resolveWorkshopOverviewRange,
    type WorkshopOverviewSeriesRange,
} from '@/lib/workshops/workshopOverviewSeriesPoints';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';

type WorkshopActivityGraphProps = {
    readonly workshopId: string;
    readonly workshopSlug: string;
    readonly refreshVersion: number;
    readonly graphState: WorkshopOverviewGraphState;
    readonly onChangeGraphState: (
        changeGraphState: (previousGraphState: WorkshopOverviewGraphState) => WorkshopOverviewGraphState,
    ) => void;
};

/**
 * The audience of a room and everything which happened in it, drawn across the time it was open
 *
 * Note: What is drawn is decided entirely by the shareable state of the graph, so a link opens exactly the graph
 *       somebody was looking at, down to the zoom, the chosen reaction and the metrics they wrote themselves.
 */
export function WorkshopActivityGraph({
    workshopId,
    workshopSlug,
    refreshVersion,
    graphState,
    onChangeGraphState,
}: WorkshopActivityGraphProps) {
    const { analytics, errorMessage, isInitialLoading, isRefreshing } = useWorkshopAdminAnalytics({
        workshopId,
        refreshVersion,
    });
    const chartContainerReference = useRef<HTMLDivElement | null>(null);

    const range = useMemo(
        () =>
            analytics === null
                ? { fromMilliseconds: 0, toMilliseconds: 1 }
                : resolveWorkshopOverviewRange(analytics, graphState),
        [analytics, graphState],
    );
    // Note: The whole span never depends on the shown one, so zooming with the wheel never measures the data again
    const fullRange = useMemo(
        () =>
            analytics === null ? { fromMilliseconds: 0, toMilliseconds: 1 } : getWorkshopOverviewFullRange(analytics),
        [analytics],
    );
    const series = useMemo(
        () =>
            analytics === null
                ? { points: [], bucketDurationSeconds: 60 }
                : buildWorkshopOverviewSeries(analytics, graphState, range),
        [analytics, graphState, range],
    );
    const descriptors = useMemo(() => getWorkshopOverviewSeriesDescriptors(graphState), [graphState]);
    const visibleDescriptors = useMemo(() => getVisibleWorkshopOverviewSeriesDescriptors(graphState), [graphState]);
    const seriesTotals = useMemo(
        () => getWorkshopOverviewSeriesTotals(series.points, descriptors),
        [descriptors, series.points],
    );

    const changeZoom = useCallback(
        (zoomedRange: WorkshopOverviewSeriesRange) =>
            onChangeGraphState((previousGraphState) => ({
                ...previousGraphState,
                zoomFromMilliseconds: zoomedRange.fromMilliseconds,
                zoomToMilliseconds: zoomedRange.toMilliseconds,
            })),
        [onChangeGraphState],
    );

    const toggleSeries = (seriesKey: WorkshopOverviewSeriesKey) =>
        onChangeGraphState((previousGraphState) => ({
            ...previousGraphState,
            visibleSeriesKeys: previousGraphState.visibleSeriesKeys.some((visibleKey) => visibleKey === seriesKey)
                ? previousGraphState.visibleSeriesKeys.filter((visibleKey) => visibleKey !== seriesKey)
                : [...previousGraphState.visibleSeriesKeys, seriesKey],
        }));

    const changeReactionEmoji = (reactionEmoji: string | null) =>
        onChangeGraphState((previousGraphState) => ({ ...previousGraphState, reactionEmoji }));

    const changeCustomMetrics = (customMetrics: readonly WorkshopOverviewCustomMetric[]) =>
        onChangeGraphState((previousGraphState) => ({ ...previousGraphState, customMetrics }));

    const zoomToWorkshop = () =>
        onChangeGraphState((previousGraphState) => ({
            ...previousGraphState,
            zoomFromMilliseconds: null,
            zoomToMilliseconds: null,
        }));

    const zoomToEverything = () => changeZoom(fullRange);

    const isAudienceEverMeasured =
        analytics !== null && analytics.timeline.some((point) => point.watchingParticipantCount > 0);
    const workshopRange = analytics === null ? null : getWorkshopOverviewWorkshopRange(analytics);
    const isWorkshopOver = workshopRange !== null && workshopRange.toMilliseconds < Date.now();

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <BarChart3 className="h-5 w-5 text-cyan-600" /> Průběh workshopu
                        {/* Note: A refresh is said by one quiet mark next to the title, never by taking the graph off
                                  the screen, so that data arriving every few seconds never makes the page blink. */}
                        {isRefreshing && !isInitialLoading && (
                            <RefreshCw
                                className="h-3.5 w-3.5 animate-spin text-slate-300"
                                aria-label="Načítají se nová data"
                            />
                        )}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Kolik lidí místnost sledovalo a co se v ní dělo v čase. Graf otevírá čas workshopu, oddálit ho
                        můžete na všechno, co se stalo před ním i po něm.
                    </p>
                </div>
                {analytics !== null && (
                    <WorkshopOverviewExportButtons
                        workshopSlug={workshopSlug}
                        points={series.points}
                        descriptors={visibleDescriptors}
                        getChartElement={() => findChartPicture(chartContainerReference.current)}
                    />
                )}
            </div>

            {isInitialLoading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                </div>
            ) : errorMessage !== null && analytics === null ? (
                <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {errorMessage}
                </div>
            ) : analytics === null ? null : (
                <>
                    <WorkshopOverviewChartControls
                        graphState={graphState}
                        descriptors={descriptors}
                        seriesTotals={seriesTotals}
                        reactionCounts={analytics.reactionCounts}
                        range={range}
                        onToggleSeries={toggleSeries}
                        onChangeReactionEmoji={changeReactionEmoji}
                        onZoomToWorkshop={zoomToWorkshop}
                        onZoomToEverything={zoomToEverything}
                    />

                    <WorkshopOverviewChart
                        points={series.points}
                        descriptors={visibleDescriptors}
                        range={range}
                        fullRange={fullRange}
                        onZoomChange={changeZoom}
                        containerReference={chartContainerReference}
                    />

                    {!isAudienceEverMeasured && isWorkshopOver && (
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                            U tohoto workshopu není zaznamenaná sledovanost — místnost si ji začala pamatovat až
                            později. Čára „Nově připojení“ ukazuje, kdy se lidé registrovali.
                        </p>
                    )}

                    {!analytics.isCommentSampleComplete && graphState.customMetrics.length > 0 && (
                        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            Vlastní metriky počítají jen z nejnovějších zpráv této místnosti, starších je příliš mnoho.
                        </p>
                    )}

                    <WorkshopOverviewCustomMetricEditor
                        customMetrics={graphState.customMetrics}
                        onChange={changeCustomMetrics}
                    />
                </>
            )}
        </section>
    );
}
