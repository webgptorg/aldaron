import { formatEventFormat, formatEventLocation, type EventLocationKind } from '@/lib/events/eventLocation';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { formatEventPrice } from '@/lib/events/eventPrice';
import {
    formatCzechWorkshopDay,
    formatCzechWorkshopDayAndMonth,
    formatCzechWorkshopTimeRange,
} from '@/lib/workshops/workshopDate';

const EVENT_DETAIL_SEPARATOR = ' · ';
const EVENT_DAY_SEPARATOR = ' / ';
const EVENT_LOCATION_SEPARATOR = ' i ';

/**
 * The same values in the order they were first written, so a summary never repeats what it has already said
 */
function selectDistinctValues(values: readonly string[]): readonly string[] {
    return Array.from(new Set(values.filter((value) => value !== '')));
}

/**
 * The first term held in one form, or `null` when no term is held that way
 *
 * Note: A page describing one form of a workshop asks for it here rather than assuming that the terms are published
 *       in any particular order, so withdrawing a term never leaves a page describing a term which is not offered.
 */
export function findEventOccurrenceByLocationKind(
    occurrences: readonly EventOccurrence[],
    locationKind: EventLocationKind,
): EventOccurrence | null {
    return occurrences.find((occurrence) => occurrence.event.locationKind === locationKind) ?? null;
}

/**
 * The days a set of terms is held on, for example `4. 9. / 9. 9. / 18. 9.`
 */
export function formatEventOccurrenceDaySummary(occurrences: readonly EventOccurrence[]): string {
    return selectDistinctValues(
        occurrences.map((occurrence) => formatCzechWorkshopDayAndMonth(occurrence.startsAt)),
    ).join(EVENT_DAY_SEPARATOR);
}

/**
 * Where a set of terms is held, for example `Praha i Online`
 */
export function formatEventOccurrenceLocationSummary(occurrences: readonly EventOccurrence[]): string {
    return selectDistinctValues(occurrences.map((occurrence) => formatEventLocation(occurrence.event))).join(
        EVENT_LOCATION_SEPARATOR,
    );
}

/**
 * How many people fit into each form of a set of terms, for example `Praha max 10 / Online max 50`
 *
 * Note: A term nobody can be turned away from is left out, because there is no number to name about it.
 */
export function formatEventOccurrenceCapacitySummary(occurrences: readonly EventOccurrence[]): string {
    return selectDistinctValues(
        occurrences.map((occurrence) =>
            occurrence.event.maximumParticipantCount === null
                ? ''
                : `${formatEventLocation(occurrence.event)} max ${occurrence.event.maximumParticipantCount}`,
        ),
    ).join(EVENT_DAY_SEPARATOR);
}

/**
 * What a set of terms costs, for example `12 000 Kč / 3 000 Kč`
 *
 * Note: Terms which cost the same are named once, so a workshop offered at one price says that price once.
 */
export function formatEventOccurrencePriceSummary(occurrences: readonly EventOccurrence[]): string {
    return selectDistinctValues(occurrences.map((occurrence) => formatEventPrice(occurrence.event.priceCzk))).join(
        EVENT_DAY_SEPARATOR,
    );
}

/**
 * One term as a visitor reads it, for example `4. 9. 2026 · 10:00–16:00 · Prezenčně · Praha · 12 000 Kč`
 *
 * Note: This is the one description of a term, so every page naming one names it the same way.
 */
export function formatEventOccurrenceSummary(occurrence: EventOccurrence): string {
    return [
        formatCzechWorkshopDay(occurrence.startsAt),
        formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt),
        formatEventFormat(occurrence.event),
        formatEventPrice(occurrence.event.priceCzk),
    ].join(EVENT_DETAIL_SEPARATOR);
}

/**
 * Every term of a set, each as a visitor reads it
 */
export function formatEventOccurrenceSummaries(occurrences: readonly EventOccurrence[]): readonly string[] {
    return occurrences.map(formatEventOccurrenceSummary);
}
