'use client';

import { Button } from '@/components/ui/button';
import { createWorkshopRoomLink, type WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

type WorkshopLinksPanelProps = {
    readonly workshops: readonly WorkshopSummary[];
    readonly participantIdentity: WorkshopParticipantIdentity;
    readonly participantPath: string;
    readonly title: string;
    readonly description: string;
    readonly emptyMessage: string;
    readonly locale: string;
    readonly timeZone: string;
};

/**
 * A compact list of workshop rooms which preserves the already verified identity of the participant in each link.
 * It is independent of the page which shows it, so another persistent room can offer the same workshop hand-off.
 */
export function WorkshopLinksPanel({
    workshops,
    participantIdentity,
    participantPath,
    title,
    description,
    emptyMessage,
    locale,
    timeZone,
}: WorkshopLinksPanelProps) {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone,
    });
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
    });

    return (
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="text-sm leading-6 text-slate-400">{description}</p>
            </div>

            {workshops.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-5 text-sm text-slate-400">
                    {emptyMessage}
                </p>
            ) : (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {workshops.map((workshop) => {
                        const workshopLink = createWorkshopRoomLink(
                            participantPath,
                            participantIdentity,
                            workshop.slug,
                        );

                        return (
                            <li key={workshop.id}>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-auto w-full justify-between whitespace-normal border-white/10 bg-white/[0.035] p-4 text-left text-slate-100 hover:border-cyan-200/50 hover:bg-cyan-300/10 hover:text-white"
                                >
                                    <Link href={workshopLink}>
                                        <span className="min-w-0">
                                            <span className="block break-words font-semibold">{workshop.title}</span>
                                            <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-slate-400">
                                                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                {dateFormatter.format(new Date(workshop.startsAt))} ·{' '}
                                                {timeFormatter.format(new Date(workshop.startsAt))}
                                            </span>
                                        </span>
                                        <ArrowUpRight className="ml-3 h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
