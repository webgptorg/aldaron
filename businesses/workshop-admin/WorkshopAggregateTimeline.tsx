'use client';

import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopExportButton } from '@/businesses/workshop-admin/WorkshopExportButton';
import { useWorkshopAdminAnalytics } from '@/businesses/workshop-admin/useWorkshopAdminAnalytics';
import type { WorkshopAdminTimelinePoint } from '@/lib/workshops/workshopTypes';
import {
    BarChart3,
    MessageCircle,
    MousePointerClick,
    Radio,
    RefreshCw,
    ThumbsUp,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useMemo } from 'react';

type WorkshopAggregateTimelineProps = {
    readonly workshopId: string;
    readonly refreshVersion: number;
};

type TimelineTotals = Omit<WorkshopAdminTimelinePoint, 'startsAt'> & {
    readonly totalCount: number;
};

type TimelineMetricKey = Exclude<keyof TimelineTotals, 'totalCount'>;

type TimelineMetricDefinition = {
    readonly key: TimelineMetricKey;
    readonly label: string;
    readonly icon: LucideIcon;
    readonly className: string;
};

const TIMELINE_METRIC_DEFINITIONS: readonly TimelineMetricDefinition[] = [
    { key: 'participantCount', label: 'Účastníci', icon: Users, className: 'bg-cyan-500' },
    { key: 'commentCount', label: 'Komentáře', icon: MessageCircle, className: 'bg-violet-500' },
    { key: 'reactionCount', label: 'Reakce', icon: Radio, className: 'bg-amber-500' },
    { key: 'upvoteCount', label: 'Hlasy', icon: ThumbsUp, className: 'bg-emerald-500' },
    { key: 'linkClickCount', label: 'Kliknutí', icon: MousePointerClick, className: 'bg-slate-500' },
];

function getTimelinePointTotal(point: WorkshopAdminTimelinePoint): number {
    return TIMELINE_METRIC_DEFINITIONS.reduce((total, metric) => total + point[metric.key], 0);
}

function getTimelineTotals(timeline: readonly WorkshopAdminTimelinePoint[]): TimelineTotals {
    return timeline.reduce<TimelineTotals>(
        (totals, point) => ({
            participantCount: totals.participantCount + point.participantCount,
            commentCount: totals.commentCount + point.commentCount,
            reactionCount: totals.reactionCount + point.reactionCount,
            upvoteCount: totals.upvoteCount + point.upvoteCount,
            linkClickCount: totals.linkClickCount + point.linkClickCount,
            totalCount: totals.totalCount + getTimelinePointTotal(point),
        }),
        { participantCount: 0, commentCount: 0, reactionCount: 0, upvoteCount: 0, linkClickCount: 0, totalCount: 0 },
    );
}

export function WorkshopAggregateTimeline({ workshopId, refreshVersion }: WorkshopAggregateTimelineProps) {
    const { analytics, errorMessage, isLoading } = useWorkshopAdminAnalytics({
        workshopId,
        refreshVersion,
    });

    const timelineTotals = useMemo(() => getTimelineTotals(analytics?.timeline ?? []), [analytics?.timeline]);
    const maximalPointTotal = useMemo(
        () => Math.max(1, ...(analytics?.timeline.map(getTimelinePointTotal) ?? [])),
        [analytics?.timeline],
    );

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <BarChart3 className="h-5 w-5 text-cyan-600" /> Souhrnná časová osa
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Každý sloupec seskupuje připojení, komentáře, reakce, hlasy a kliknutí do jednoho časového
                        úseku.
                    </p>
                </div>
                <WorkshopExportButton workshopId={workshopId} exportKind="timeline" label="CSV časové osy" />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                </div>
            ) : errorMessage !== null ? (
                <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {errorMessage}
                </div>
            ) : analytics === null || analytics.timeline.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                    Zatím není zaznamenána žádná aktivita.
                </div>
            ) : (
                <>
                    <dl className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        {TIMELINE_METRIC_DEFINITIONS.map((metric) => {
                            const MetricIcon = metric.icon;
                            return (
                                <div key={metric.key} className="rounded-lg bg-slate-50 px-3 py-2">
                                    <dt className="flex items-center gap-1 text-xs text-slate-500">
                                        <MetricIcon className="h-3.5 w-3.5" /> {metric.label}
                                    </dt>
                                    <dd className="mt-1 text-lg font-bold text-slate-900">
                                        {timelineTotals[metric.key]}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>

                    <div className="mt-4">
                        <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                            <span>Celkové rozložení {timelineTotals.totalCount} zaznamenaných akcí</span>
                            <span>Barvy odpovídají časové ose níže.</span>
                        </div>
                        <div
                            className="mt-2 flex h-4 overflow-hidden rounded-full bg-slate-100"
                            aria-label={`Celkem ${timelineTotals.totalCount} zaznamenaných akcí`}
                        >
                            {TIMELINE_METRIC_DEFINITIONS.map((metric) =>
                                timelineTotals[metric.key] === 0 ? null : (
                                    <span
                                        key={metric.key}
                                        className={metric.className}
                                        style={{
                                            width: `${(timelineTotals[metric.key] / timelineTotals.totalCount) * 100}%`,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    </div>

                    <ol className="mt-6 space-y-3" aria-label="Souhrnná aktivita v čase">
                        {analytics.timeline.map((point) => {
                            const pointTotal = getTimelinePointTotal(point);
                            return (
                                <li key={point.startsAt} className="rounded-xl border border-slate-100 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <time className="font-medium text-slate-700">
                                            {formatWorkshopAdminDateTime(point.startsAt)}
                                        </time>
                                        <span className="font-semibold text-slate-900">Celkem {pointTotal} akcí</span>
                                    </div>
                                    <div
                                        className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100"
                                        aria-label={`Celkem ${pointTotal} akcí`}
                                    >
                                        {TIMELINE_METRIC_DEFINITIONS.map((metric) =>
                                            point[metric.key] === 0 ? null : (
                                                <span
                                                    key={metric.key}
                                                    className={metric.className}
                                                    style={{
                                                        width: `${(point[metric.key] / maximalPointTotal) * 100}%`,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {point.participantCount} účastníků · {point.commentCount} komentářů ·{' '}
                                        {point.reactionCount} reakcí · {point.upvoteCount} hlasů ·{' '}
                                        {point.linkClickCount} kliknutí
                                    </p>
                                </li>
                            );
                        })}
                    </ol>
                </>
            )}
        </section>
    );
}
