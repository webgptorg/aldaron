import { formatEventFormat } from '@/lib/events/eventLocation';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { cn } from '@/lib/utils';
import { formatCzechWorkshopDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
import type { LucideIcon } from 'lucide-react';

type EventTermOptionCardProps = {
    readonly occurrence: EventOccurrence;
    readonly isSelected: boolean;
    readonly onSelect: () => void;

    /**
     * Whether the card says what this very term is about
     *
     * Note: An event whose terms each have a subject of their own is chosen by that subject, so those cards name it.
     *       An event which is the very same workshop held in another form or on another day is chosen by when and
     *       where it is, and naming it again on every card would only repeat what the card already carries.
     */
    readonly isTopicShown?: boolean;

    /**
     * Icon and text of the one line each landing page adds about its terms, such as how long they take or how many
     * seats are left in them
     */
    readonly noteIcon: LucideIcon;
    readonly noteText: string;
};

/**
 * One term of an event as a visitor picks it, which says when it is held, what it is about, in what form, and at what
 * price
 *
 * Note: Every landing page which lets a visitor choose between the terms of its event picks them with this one card,
 *       so the terms of two events are never offered in two different ways. What only one of those pages knows about
 *       its terms is said in the note beneath.
 */
export function EventTermOptionCard({
    occurrence,
    isSelected,
    onSelect,
    isTopicShown = false,
    noteIcon: NoteIcon,
    noteText,
}: EventTermOptionCardProps) {
    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={onSelect}
            className={cn(
                'rounded-xl border p-4 text-left transition-all',
                isSelected
                    ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
                    : 'border-slate-200 bg-white hover:border-cyan-200',
            )}
        >
            <span className="block text-lg font-bold text-slate-950">
                {formatCzechWorkshopDay(occurrence.startsAt)} ·{' '}
                {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
            </span>
            {isTopicShown && (
                <>
                    <span className="mt-2 block font-semibold text-slate-950">{occurrence.title}</span>
                    {occurrence.description.trim() !== '' && (
                        <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                            {occurrence.description}
                        </span>
                    )}
                </>
            )}
            <span className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {formatEventFormat(occurrence.event)}
                </span>
                <span className="font-medium text-slate-700">{formatEventPrice(occurrence.event.priceCzk)}</span>
            </span>
            <span className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <NoteIcon className="h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" />
                {noteText}
            </span>
        </button>
    );
}
