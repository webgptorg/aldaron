'use client';

import { Button } from '@/components/ui/button';
import { createCalendarFileName, createCalendarLinks } from '@/lib/calendar/create-calendar-links';
import { createPublicEventCalendarEventOrNull } from '@/lib/events/eventCalendar';
import { createEventLinkOrNull } from '@/lib/events/eventLinks';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition } from '@/lib/events/eventTypes';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { ArrowUpRight, CalendarDays, CalendarPlus, Download } from 'lucide-react';
import Link from 'next/link';

export type WorkshopCalendarSubscription = {
    readonly url: string;
    readonly label: string;
};

type WorkshopLinksPanelProps = {
    readonly workshops: readonly WorkshopSummary[];
    readonly participantIdentity: WorkshopParticipantIdentity;
    readonly title: string;
    readonly description: string;
    readonly emptyMessage: string;
    readonly locale: string;
    readonly timeZone: string;
    readonly calendarSubscription?: WorkshopCalendarSubscription;
};

/**
 * A compact list of the terms of every kind of event, which preserves the already verified identity of the
 * participant in each link. It is independent of the page which shows it, so another persistent room can offer the
 * same hand-off, and a kind of event added later is listed here without a change of this list.
 */
export function WorkshopLinksPanel({
    workshops,
    participantIdentity,
    title,
    description,
    emptyMessage,
    locale,
    timeZone,
    calendarSubscription,
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

    // Note: A term the application cannot lead anywhere is deliberately left out instead of being offered as a link
    //       which would open a different event.
    const linkedWorkshops = workshops.flatMap((workshop) => {
        const workshopLink = createEventLinkOrNull(workshop, participantIdentity);
        const calendarEvent = createPublicEventCalendarEventOrNull(workshop);
        return workshopLink === null || workshop.event === null || calendarEvent === null
            ? []
            : [{ workshop, workshopLink, event: workshop.event, calendarEvent }];
    });

    return (
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <p className="text-sm leading-6 text-slate-400">{description}</p>
                </div>
                {calendarSubscription !== undefined && linkedWorkshops.length > 0 ? (
                    <a
                        href={calendarSubscription.url}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20 hover:text-white"
                    >
                        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                        {calendarSubscription.label}
                    </a>
                ) : null}
            </div>

            {linkedWorkshops.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-5 text-sm text-slate-400">
                    {emptyMessage}
                </p>
            ) : (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {linkedWorkshops.map(({ workshop, workshopLink, event, calendarEvent }) => {
                        const { icalendarDataUrl } = createCalendarLinks(calendarEvent);

                        return (
                            <li key={workshop.id} className="flex flex-col gap-2">
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
                                            <span className="mt-1 block break-words text-xs font-normal text-slate-500">
                                                {getEventTypeDefinition(event.type).label} · {formatEventFormat(event)} ·{' '}
                                                {formatEventPrice(event.priceCzk)}
                                            </span>
                                        </span>
                                        <ArrowUpRight
                                            className="ml-3 h-4 w-4 shrink-0 text-cyan-200"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </Button>
                                <a
                                    href={icalendarDataUrl}
                                    download={createCalendarFileName(workshop.slug)}
                                    className="inline-flex w-fit items-center gap-1.5 self-end rounded-lg px-2 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                                >
                                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                    Stáhnout .ics
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
