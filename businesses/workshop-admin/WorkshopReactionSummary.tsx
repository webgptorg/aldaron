'use client';

import { useWorkshopAdminAnalytics } from '@/businesses/workshop-admin/useWorkshopAdminAnalytics';
import { Radio, RefreshCw } from 'lucide-react';

type WorkshopReactionSummaryProps = {
    readonly workshopId: string;
    readonly refreshVersion: number;
};

function getReactionSharePercent(reactionCount: number, totalReactionCount: number): number {
    return totalReactionCount === 0 ? 0 : (reactionCount / totalReactionCount) * 100;
}

/**
 * Shows reaction volume by emoji without putting the full, potentially very large event stream into the admin page.
 */
export function WorkshopReactionSummary({ workshopId, refreshVersion }: WorkshopReactionSummaryProps) {
    const { analytics, errorMessage, isLoading } = useWorkshopAdminAnalytics({
        workshopId,
        refreshVersion,
    });
    const totalReactionCount =
        analytics?.reactionCounts.reduce((total, reactionCount) => total + reactionCount.count, 0) ?? 0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <Radio className="h-5 w-5 text-amber-500" /> Přehled reakcí
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Souhrn podle typu reakce; úplný seznam včetně času a autora stáhnete jako CSV.
            </p>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                </div>
            ) : errorMessage !== null ? (
                <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {errorMessage}
                </div>
            ) : analytics === null || analytics.reactionCounts.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                    Zatím není zaznamenána žádná reakce.
                </div>
            ) : (
                <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Reakce podle typu">
                    {analytics.reactionCounts.map((reactionCount) => (
                        <li key={reactionCount.emoji} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-2xl" aria-hidden="true">
                                    {reactionCount.emoji}
                                </span>
                                <span className="text-lg font-bold text-slate-900">{reactionCount.count}</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-amber-500"
                                    style={{
                                        width: `${getReactionSharePercent(reactionCount.count, totalReactionCount)}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {getReactionSharePercent(reactionCount.count, totalReactionCount).toFixed(1)} % ze všech
                                reakcí
                            </p>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
