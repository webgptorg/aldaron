import { DEFAULT_WORKSHOP_DURATION_MINUTES } from '@/lib/workshops/workshopConstants';

const MILLISECONDS_PER_MINUTE = 60 * 1000;

/**
 * Where one occurrence currently stands in time
 */
export const WORKSHOP_PHASE_VALUES = ['ongoing', 'upcoming', 'past'] as const;

export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];

/**
 * As much of a workshop as it takes to decide when it happens
 *
 * Note: Both a summary and the full details of a workshop satisfy this shape, so nothing has to be loaded just to
 *       place an occurrence in time.
 */
export type WorkshopOccurrenceTiming = {
    readonly startsAt: string;
    readonly endsAt: string | null;
};

/**
 * The order in which an administrator needs the phases: what runs right now, then what is being prepared, and
 * finally the history.
 */
const WORKSHOP_PHASE_ORDER: Readonly<Record<WorkshopPhase, number>> = {
    ongoing: 0,
    upcoming: 1,
    past: 2,
};

/**
 * Moment a workshop ends, taken from its usual length whenever the workshop itself does not say
 *
 * Note: This is the single rule for the length of a workshop without a recorded end, so a calendar invitation and the
 *       administration never disagree about whether an occurrence is over.
 */
export function getWorkshopEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number {
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    const endsAtMilliseconds = occurrence.endsAt === null ? Number.NaN : Date.parse(occurrence.endsAt);

    return endsAtMilliseconds > startsAtMilliseconds
        ? endsAtMilliseconds
        : startsAtMilliseconds + DEFAULT_WORKSHOP_DURATION_MINUTES * MILLISECONDS_PER_MINUTE;
}

/**
 * Decides whether an occurrence is still ahead, running right now, or already over
 *
 * @param currentTimeMilliseconds moment to compare against, so a list places every occurrence against the same instant
 */
export function getWorkshopPhase(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds = Date.now(),
): WorkshopPhase {
    if (Date.parse(occurrence.startsAt) > currentTimeMilliseconds) {
        return 'upcoming';
    }

    return getWorkshopEndsAtMilliseconds(occurrence) > currentTimeMilliseconds ? 'ongoing' : 'past';
}

/**
 * The two keys which order one occurrence among the others
 *
 * Note: The history is ranked by its negated date, so the term which ended last leads it while the future is led by
 *       the term which starts next. The most relevant occurrence of every group therefore stays on top of it.
 */
function getWorkshopPhaseOrder(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds: number,
): { readonly phaseRank: number; readonly dateRank: number } {
    const phase = getWorkshopPhase(occurrence, currentTimeMilliseconds);
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    const dateRank = Number.isFinite(startsAtMilliseconds) ? startsAtMilliseconds : 0;

    return { phaseRank: WORKSHOP_PHASE_ORDER[phase], dateRank: phase === 'past' ? -dateRank : dateRank };
}

/**
 * Orders occurrences by their phase first and by their date within every phase
 *
 * @param currentTimeMilliseconds moment which decides the phases, so one list is never sorted against a moving instant
 */
export function sortWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): readonly TWorkshop[] {
    return workshops
        .map((workshop) => ({ workshop, order: getWorkshopPhaseOrder(workshop, currentTimeMilliseconds) }))
        .sort(
            (firstEntry, secondEntry) =>
                firstEntry.order.phaseRank - secondEntry.order.phaseRank ||
                firstEntry.order.dateRank - secondEntry.order.dateRank,
        )
        .map(({ workshop }) => workshop);
}
