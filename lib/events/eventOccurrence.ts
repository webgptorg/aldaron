import type { EventDetails } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * One term which really is an event, so everything reading it already knows what kind of event it is, where it is
 * held, and what it costs
 */
export type EventOccurrence = WorkshopSummary & {
    readonly event: EventDetails;
};

export function isEventOccurrence(workshop: WorkshopSummary): workshop is EventOccurrence {
    return workshop.event !== null;
}

/**
 * A list which really has a term in it, so whatever reads it always has one to describe
 */
export type NonEmptyEventOccurrenceList = readonly [EventOccurrence, ...EventOccurrence[]];

export function isNonEmptyEventOccurrenceList(
    occurrences: readonly EventOccurrence[],
): occurrences is NonEmptyEventOccurrenceList {
    return occurrences.length > 0;
}

/**
 * The terms of a list which the application can describe as events
 *
 * Note: A room which is no event, or a term of an event this application does not know, is left out rather than
 *       listed as something it is not.
 */
export function selectEventOccurrences(workshops: readonly WorkshopSummary[]): readonly EventOccurrence[] {
    return workshops.filter(isEventOccurrence);
}
