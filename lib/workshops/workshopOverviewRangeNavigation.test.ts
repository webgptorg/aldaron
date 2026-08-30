import {
    clampWorkshopOverviewRange,
    getMovedWorkshopOverviewRange,
    getZoomedWorkshopOverviewRange,
    isWorkshopOverviewRangeMovableLeft,
    isWorkshopOverviewRangeMovableRight,
    isWorkshopOverviewRangeZoomableIn,
    isWorkshopOverviewRangeZoomableOut,
} from './workshopOverviewRangeNavigation';
import { describe, expect, it } from 'vitest';

const HOUR_MILLISECONDS = 60 * 60 * 1_000;
const FULL_RANGE = { fromMilliseconds: 0, toMilliseconds: 8 * HOUR_MILLISECONDS };
const SHOWN_RANGE = { fromMilliseconds: 2 * HOUR_MILLISECONDS, toMilliseconds: 4 * HOUR_MILLISECONDS };

describe('clampWorkshopOverviewRange', () => {
    it('keeps a selected range inside the measured data while retaining its minimum useful duration', () => {
        expect(
            clampWorkshopOverviewRange(
                {
                    fromMilliseconds: FULL_RANGE.toMilliseconds - 30_000,
                    toMilliseconds: FULL_RANGE.toMilliseconds + 30_000,
                },
                FULL_RANGE,
            ),
        ).toEqual({
            fromMilliseconds: FULL_RANGE.toMilliseconds - 60_000,
            toMilliseconds: FULL_RANGE.toMilliseconds,
        });
    });
});

describe('getZoomedWorkshopOverviewRange', () => {
    it('zooms around the selected part of the graph without leaving the full range', () => {
        expect(getZoomedWorkshopOverviewRange(SHOWN_RANGE, FULL_RANGE, 'in')).toEqual({
            fromMilliseconds: 2 * HOUR_MILLISECONDS + 12 * 60_000,
            toMilliseconds: 4 * HOUR_MILLISECONDS - 12 * 60_000,
        });

        expect(getZoomedWorkshopOverviewRange(SHOWN_RANGE, FULL_RANGE, 'out', 0.25)).toEqual({
            fromMilliseconds: 2 * HOUR_MILLISECONDS - 6 * 60_000,
            toMilliseconds: 4 * HOUR_MILLISECONDS + 18 * 60_000,
        });
    });
});

describe('getMovedWorkshopOverviewRange', () => {
    it('moves by half of the current span and stops at each end of the measured data', () => {
        expect(getMovedWorkshopOverviewRange(SHOWN_RANGE, FULL_RANGE, 'left')).toEqual({
            fromMilliseconds: HOUR_MILLISECONDS,
            toMilliseconds: 3 * HOUR_MILLISECONDS,
        });
        expect(getMovedWorkshopOverviewRange(SHOWN_RANGE, FULL_RANGE, 'right')).toEqual({
            fromMilliseconds: 3 * HOUR_MILLISECONDS,
            toMilliseconds: 5 * HOUR_MILLISECONDS,
        });
        expect(
            getMovedWorkshopOverviewRange(
                { fromMilliseconds: 0, toMilliseconds: 2 * HOUR_MILLISECONDS },
                FULL_RANGE,
                'left',
            ),
        ).toEqual({ fromMilliseconds: 0, toMilliseconds: 2 * HOUR_MILLISECONDS });
        expect(
            getMovedWorkshopOverviewRange(
                { fromMilliseconds: 6 * HOUR_MILLISECONDS, toMilliseconds: FULL_RANGE.toMilliseconds },
                FULL_RANGE,
                'right',
            ),
        ).toEqual({
            fromMilliseconds: 6 * HOUR_MILLISECONDS,
            toMilliseconds: FULL_RANGE.toMilliseconds,
        });
    });
});

describe('workshop overview range navigation availability', () => {
    it('makes only meaningful navigation actions available', () => {
        expect(isWorkshopOverviewRangeZoomableIn(FULL_RANGE, FULL_RANGE)).toBe(true);
        expect(isWorkshopOverviewRangeZoomableOut(FULL_RANGE, FULL_RANGE)).toBe(false);
        expect(isWorkshopOverviewRangeMovableLeft(FULL_RANGE, FULL_RANGE)).toBe(false);
        expect(isWorkshopOverviewRangeMovableRight(FULL_RANGE, FULL_RANGE)).toBe(false);

        expect(isWorkshopOverviewRangeZoomableOut(SHOWN_RANGE, FULL_RANGE)).toBe(true);
        expect(isWorkshopOverviewRangeMovableLeft(SHOWN_RANGE, FULL_RANGE)).toBe(true);
        expect(isWorkshopOverviewRangeMovableRight(SHOWN_RANGE, FULL_RANGE)).toBe(true);

        const MINIMAL_RANGE = { fromMilliseconds: 0, toMilliseconds: 60_000 };
        expect(isWorkshopOverviewRangeZoomableIn(MINIMAL_RANGE, FULL_RANGE)).toBe(false);
    });
});
