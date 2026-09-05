'use client';

import type { CommunityPreview } from '@/lib/community/communityPreviewTypes';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { formatCzechWorkshopDayAndMonth } from '@/lib/workshops/workshopDate';
import { BookOpenCheck } from 'lucide-react';

/**
 * The topics the archive is described with while the published terms cannot be read
 */
const FALLBACK_WEBINAR_TOPICS: readonly string[] = ['Git a AI', 'AI a databáze', 'Testování', 'Práce s kontextem'];

type CommunityMembershipWebinarArchiveProps = {
    readonly preview: CommunityPreview;
};

/**
 * One webinar as the list of them names it, either a published term or a topic of the fallback
 */
type ListedWebinar = {
    readonly key: string;
    readonly title: string;
    readonly dateLabel: string | null;
};

function selectListedWebinars(preview: CommunityPreview): readonly ListedWebinar[] {
    if (preview.upcomingWebinars.length === 0) {
        return FALLBACK_WEBINAR_TOPICS.map((topic) => ({ key: topic, title: topic, dateLabel: null }));
    }

    return preview.upcomingWebinars.map((webinar) => ({
        key: webinar.id,
        title: webinar.title,
        dateLabel: formatCzechWorkshopDayAndMonth(webinar.startsAt),
    }));
}

/**
 * Says what a member can come back to, out of the terms which are really published
 *
 * Note: The list names the webinars which are still ahead, because those are the ones whose recording a membership
 *       started today opens. How many have already been broadcast is said as a number rather than as a list, so the
 *       same title held twice does not read as one repeated line.
 */
export function CommunityMembershipWebinarArchive({ preview }: CommunityMembershipWebinarArchiveProps) {
    const listedWebinars = selectListedWebinars(preview);
    const isUpcomingListed = preview.upcomingWebinars.length > 0;

    return (
        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
            <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <BookOpenCheck className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
                        Pusťte si webinář znovu
                    </h2>
                    <p className="mt-4 leading-relaxed text-slate-600">
                        Záznam můžete zastavit u části, kterou právě potřebujete. Vraťte se k ní, až ji budete řešit, ne
                        ve chvíli, kdy zrovna běží vysílání.
                    </p>
                </div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                        {isUpcomingListed ? 'Nejbližší živé webináře' : 'V archivu najdete třeba'}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {listedWebinars.map((webinar, index) => (
                            <div
                                key={webinar.key}
                                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-mono text-xs font-bold text-cyan-200">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="min-w-0">
                                    <span className="block break-words font-semibold text-slate-800">
                                        {webinar.title}
                                    </span>
                                    {webinar.dateLabel !== null && (
                                        <span className="mt-0.5 block text-xs text-slate-500">{webinar.dateLabel}</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                    {preview.totals.heldWebinarCount > 0 && (
                        <p className="mt-5 text-sm text-slate-600">
                            V archivu jsou také{' '}
                            {formatCzechCountedNoun(preview.totals.heldWebinarCount, [
                                'odvysílaný webinář',
                                'odvysílané webináře',
                                'odvysílaných webinářů',
                            ])}
                            .
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
