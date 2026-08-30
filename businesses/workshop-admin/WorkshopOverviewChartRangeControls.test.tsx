/**
 * @vitest-environment jsdom
 */

import { WorkshopOverviewChartRangeControls } from '@/businesses/workshop-admin/WorkshopOverviewChartRangeControls';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const HOUR_MILLISECONDS = 60 * 60 * 1_000;
const FULL_RANGE = { fromMilliseconds: 0, toMilliseconds: 4 * HOUR_MILLISECONDS };
const SHOWN_RANGE = { fromMilliseconds: HOUR_MILLISECONDS, toMilliseconds: 3 * HOUR_MILLISECONDS };

function renderRangeControls({
    range = SHOWN_RANGE,
    onZoomChange = vi.fn(),
    onZoomToSchedule = vi.fn(),
}: {
    readonly range?: typeof SHOWN_RANGE;
    readonly onZoomChange?: (range: typeof SHOWN_RANGE) => void;
    readonly onZoomToSchedule?: (() => void) | null;
} = {}) {
    render(
        <WorkshopOverviewChartRangeControls
            range={range}
            fullRange={FULL_RANGE}
            onZoomChange={onZoomChange}
            onZoomToSchedule={onZoomToSchedule}
        />,
    );

    return { onZoomChange, onZoomToSchedule };
}

afterEach(cleanup);

describe('workshop overview chart range controls', () => {
    it('offers labelled zoom and move buttons that change the graph range', () => {
        const { onZoomChange } = renderRangeControls();

        fireEvent.click(screen.getByRole('button', { name: 'Přiblížit' }));
        expect(onZoomChange).toHaveBeenLastCalledWith({
            fromMilliseconds: HOUR_MILLISECONDS + 12 * 60_000,
            toMilliseconds: 3 * HOUR_MILLISECONDS - 12 * 60_000,
        });

        fireEvent.click(screen.getByRole('button', { name: 'Doleva' }));
        expect(onZoomChange).toHaveBeenLastCalledWith({
            fromMilliseconds: 0,
            toMilliseconds: 2 * HOUR_MILLISECONDS,
        });

        fireEvent.click(screen.getByRole('button', { name: 'Doprava' }));
        expect(onZoomChange).toHaveBeenLastCalledWith({
            fromMilliseconds: 2 * HOUR_MILLISECONDS,
            toMilliseconds: 4 * HOUR_MILLISECONDS,
        });
    });

    it('keeps controls which cannot change the range disabled at the edges', () => {
        renderRangeControls({ range: FULL_RANGE });

        expect(screen.getByRole('button', { name: 'Oddálit' }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByRole('button', { name: 'Doleva' }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByRole('button', { name: 'Doprava' }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByRole('button', { name: 'Přiblížit' }).hasAttribute('disabled')).toBe(false);
    });

    it('keeps the workshop-time shortcut available next to the touch controls', () => {
        const { onZoomToSchedule } = renderRangeControls();

        fireEvent.click(screen.getByRole('button', { name: 'Čas workshopu' }));

        expect(onZoomToSchedule).toHaveBeenCalledOnce();
    });
});
