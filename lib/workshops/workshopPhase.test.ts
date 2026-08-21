import {
    getWorkshopEndsAtMilliseconds,
    getWorkshopPhase,
    sortWorkshopsByPhase,
    type WorkshopOccurrenceTiming,
} from '@/lib/workshops/workshopPhase';
import { describe, expect, it } from 'vitest';

const CURRENT_TIME_MILLISECONDS = Date.parse('2026-08-21T19:30:00+02:00');

const PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};
const OLDER_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-06-10T19:00:00+02:00',
    endsAt: '2026-06-10T20:30:00+02:00',
};
const ONGOING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
};
const UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
};
const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-10-10T19:00:00+02:00',
    endsAt: '2026-10-10T20:30:00+02:00',
};

describe('workshop phase', () => {
    it('places an occurrence against the given moment', () => {
        expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
    });

    it('lets a workshop without a recorded end last as long as its calendar invitation', () => {
        const workshopWithoutEnd: WorkshopOccurrenceTiming = { startsAt: '2026-08-21T19:00:00+02:00', endsAt: null };

        expect(getWorkshopEndsAtMilliseconds(workshopWithoutEnd)).toBe(Date.parse('2026-08-21T20:00:00+02:00'));
        expect(getWorkshopPhase(workshopWithoutEnd, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(workshopWithoutEnd, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('past');
    });

    it('keeps an occurrence ongoing until its very end and upcoming until its very start', () => {
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe('upcoming');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('past');
    });
});

describe('workshop phase ordering', () => {
    it('lists what runs now first, then what starts soonest, and finally what ended last', () => {
        const sortedWorkshops = sortWorkshopsByPhase(
            [OLDER_PAST_WORKSHOP, LATER_UPCOMING_WORKSHOP, PAST_WORKSHOP, UPCOMING_WORKSHOP, ONGOING_WORKSHOP],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(sortedWorkshops).toEqual([
            ONGOING_WORKSHOP,
            UPCOMING_WORKSHOP,
            LATER_UPCOMING_WORKSHOP,
            PAST_WORKSHOP,
            OLDER_PAST_WORKSHOP,
        ]);
    });

    it('leaves the listed workshops untouched', () => {
        const workshops = [UPCOMING_WORKSHOP, ONGOING_WORKSHOP];

        sortWorkshopsByPhase(workshops, CURRENT_TIME_MILLISECONDS);

        expect(workshops).toEqual([UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);
    });
});
