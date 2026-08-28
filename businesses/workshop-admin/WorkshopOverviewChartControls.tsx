'use client';

import { formatWorkshopOverviewPointTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopOverviewSeriesSwatch } from '@/businesses/workshop-admin/WorkshopOverviewSeriesSwatch';
import { Button } from '@/components/ui/button';
import type { WorkshopOverviewGraphState } from '@/lib/workshops/workshopOverviewGraphState';
import {
    WORKSHOP_OVERVIEW_SERIES_DEFINITIONS,
    type WorkshopOverviewSeriesDescriptor,
    type WorkshopOverviewSeriesKey,
} from '@/lib/workshops/workshopOverviewSeries';
import type { WorkshopOverviewSeriesRange } from '@/lib/workshops/workshopOverviewSeriesPoints';
import type { WorkshopReactionCount } from '@/lib/workshops/workshopTypes';
import { Maximize2, Target } from 'lucide-react';

type WorkshopOverviewChartControlsProps = {
    readonly graphState: WorkshopOverviewGraphState;

    /**
     * Every line the graph knows, switched on or off, so that the toggles are the legend as well
     */
    readonly descriptors: readonly WorkshopOverviewSeriesDescriptor[];

    /**
     * How much of each line is in the shown span, which is what makes the value of a line readable without hovering it
     */
    readonly seriesTotals: Readonly<Record<string, number>>;

    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly range: WorkshopOverviewSeriesRange;
    readonly onToggleSeries: (seriesKey: WorkshopOverviewSeriesKey) => void;
    readonly onChangeReactionEmoji: (reactionEmoji: string | null) => void;

    /**
     * Returns to the time the room is held at, or `null` in a room which is not held at one and therefore has no span
     * of its own to return to
     */
    readonly onZoomToSchedule: (() => void) | null;
    readonly onZoomToEverything: () => void;
};

const ALL_REACTIONS_VALUE = 'all';

function isSeriesVisible(graphState: WorkshopOverviewGraphState, seriesId: string): boolean {
    return graphState.visibleSeriesKeys.some((seriesKey) => seriesKey === seriesId);
}

/**
 * Which lines the graph draws, which reaction it counts and how far it is zoomed out, in one row above the chart
 */
export function WorkshopOverviewChartControls({
    graphState,
    descriptors,
    seriesTotals,
    reactionCounts,
    range,
    onToggleSeries,
    onChangeReactionEmoji,
    onZoomToSchedule,
    onZoomToEverything,
}: WorkshopOverviewChartControlsProps) {
    const standardSeriesKeys = WORKSHOP_OVERVIEW_SERIES_DEFINITIONS.map((seriesDefinition) => seriesDefinition.key);

    return (
        <div className="mt-5 space-y-3">
            <ul className="flex flex-wrap gap-2" aria-label="Čáry grafu">
                {descriptors.map((descriptor) => {
                    const isStandardSeries = standardSeriesKeys.some((seriesKey) => seriesKey === descriptor.id);
                    const isVisible = !isStandardSeries || isSeriesVisible(graphState, descriptor.id);
                    const seriesTotal = seriesTotals[descriptor.id] ?? 0;

                    return (
                        <li key={descriptor.id}>
                            <button
                                type="button"
                                disabled={!isStandardSeries}
                                aria-pressed={isVisible}
                                title={descriptor.description}
                                onClick={() =>
                                    isStandardSeries && onToggleSeries(descriptor.id as WorkshopOverviewSeriesKey)
                                }
                                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left transition-colors ${
                                    isVisible
                                        ? 'border-slate-300 bg-white'
                                        : 'border-slate-200 bg-slate-50 text-slate-400'
                                } ${isStandardSeries ? 'hover:border-slate-400' : 'cursor-default'}`}
                            >
                                <WorkshopOverviewSeriesSwatch descriptor={descriptor} isVisible={isVisible} />
                                <span className="text-xs text-slate-500">{descriptor.label}</span>
                                <span
                                    className={`text-sm font-bold tabular-nums ${
                                        isVisible ? 'text-slate-950' : 'text-slate-400'
                                    }`}
                                >
                                    {seriesTotal}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                    Reakce
                    <select
                        value={graphState.reactionEmoji ?? ALL_REACTIONS_VALUE}
                        onChange={(changeEvent) =>
                            onChangeReactionEmoji(
                                changeEvent.target.value === ALL_REACTIONS_VALUE ? null : changeEvent.target.value,
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                    >
                        <option value={ALL_REACTIONS_VALUE}>Všechny reakce</option>
                        {reactionCounts.map((reactionCount) => (
                            <option key={reactionCount.emoji} value={reactionCount.emoji}>
                                {reactionCount.emoji} ({reactionCount.count})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex items-center gap-2">
                    {onZoomToSchedule !== null && (
                        <Button type="button" variant="outline" size="sm" onClick={onZoomToSchedule}>
                            <Target className="mr-1.5 h-4 w-4" /> Čas workshopu
                        </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={onZoomToEverything}>
                        <Maximize2 className="mr-1.5 h-4 w-4" /> Vše
                    </Button>
                </div>

                <p className="text-xs text-slate-500">
                    {formatWorkshopOverviewPointTime(range.fromMilliseconds)} –{' '}
                    {formatWorkshopOverviewPointTime(range.toMilliseconds)} · tažením myši přiblížíte, kolečkem oddálíte
                </p>
            </div>
        </div>
    );
}
