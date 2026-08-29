import {
    createCalendarDayKey,
    createCalendarMonthWeeks,
    createCalendarWeekDayLabels,
    formatCalendarDayTitle,
    formatCalendarMonthTitle,
    getCalendarDayNumber,
    getCalendarMonthKey,
    isCalendarDayInMonth,
    shiftCalendarMonthKey,
} from '@/lib/calendar/calendarMonth';
import { describe, expect, it } from 'vitest';

const PRAGUE_TIME_ZONE = 'Europe/Prague';

describe('calendar month', () => {
    it('dates a term by the day it falls on in the country the calendar is drawn for', () => {
        expect(createCalendarDayKey('2026-09-10T19:00:00+02:00', PRAGUE_TIME_ZONE)).toBe('2026-09-10');
        expect(createCalendarDayKey('2026-09-10T23:30:00Z', PRAGUE_TIME_ZONE)).toBe('2026-09-11');
        expect(createCalendarDayKey('2026-01-01T00:30:00+01:00', PRAGUE_TIME_ZONE)).toBe('2026-01-01');
    });

    it('starts every week on Monday, as the Czech Republic does', () => {
        expect(createCalendarWeekDayLabels('cs-CZ')).toEqual(['po', 'út', 'st', 'čt', 'pá', 'so', 'ne']);
        expect(createCalendarMonthWeeks('2026-09')[0]).toEqual([
            '2026-08-31',
            '2026-09-01',
            '2026-09-02',
            '2026-09-03',
            '2026-09-04',
            '2026-09-05',
            '2026-09-06',
        ]);
    });

    it('draws a month out of whole weeks, filled up with the days around it', () => {
        const weeks = createCalendarMonthWeeks('2026-09');

        expect(weeks).toHaveLength(5);
        expect(weeks.every((week) => week.length === 7)).toBe(true);
        expect(weeks.flat()).toContain('2026-09-30');
        expect(weeks[weeks.length - 1]?.[6]).toBe('2026-10-04');
    });

    it('draws a month which starts on a Monday without a week of its neighbours', () => {
        const weeks = createCalendarMonthWeeks('2026-06');

        expect(weeks[0]?.[0]).toBe('2026-06-01');
        expect(weeks.flat()).toHaveLength(35);
    });

    it('pages from one month into the next and back over the turn of a year', () => {
        expect(shiftCalendarMonthKey('2026-12', 1)).toBe('2027-01');
        expect(shiftCalendarMonthKey('2026-01', -1)).toBe('2025-12');
        expect(shiftCalendarMonthKey('2026-09', 0)).toBe('2026-09');
    });

    it('reads the month and the number of a day out of the day itself', () => {
        expect(getCalendarMonthKey('2026-09-04')).toBe('2026-09');
        expect(getCalendarDayNumber('2026-09-04')).toBe(4);
        expect(isCalendarDayInMonth('2026-09-04', '2026-09')).toBe(true);
        expect(isCalendarDayInMonth('2026-10-04', '2026-09')).toBe(false);
    });

    it('names a month and a day the way the country reading them names them', () => {
        expect(formatCalendarMonthTitle('2026-09', 'cs-CZ')).toBe('září 2026');
        expect(formatCalendarDayTitle('2026-09-04', 'cs-CZ')).toBe('pátek 4. září 2026');
    });
});
