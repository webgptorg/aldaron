/**
 * @vitest-environment jsdom
 */

import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopSelectorCardList } from '@/businesses/workshop-admin/WorkshopSelectorCardList';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ONGOING_WORKSHOP: WorkshopAdminSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    isPublished: true,
    participantCount: 42,
};
const UPCOMING_WORKSHOP: WorkshopAdminSummary = {
    id: 'upcoming-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-09-10',
    title: 'Produkční kód s AI agenty v září',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 3,
};
const PAST_WORKSHOP: WorkshopAdminSummary = {
    id: 'past-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-07-10',
    title: 'Produkční kód s AI agenty v červenci',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 1,
};

function renderWorkshopSelectorCardList(
    workshops: readonly WorkshopAdminSummary[],
    onSelect: (workshopId: string) => void = vi.fn(),
) {
    render(
        <WorkshopSelectorCardList
            label="Workshop"
            workshops={workshops}
            selectedWorkshopId={ONGOING_WORKSHOP.id}
            isLoading={false}
            emptyMessage="Vytvořte první workshop."
            onSelect={onSelect}
        />,
    );
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T19:30:00+02:00'));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('workshop selector card list', () => {
    it('leads with the running workshop, then the prepared terms, and closes with the history', () => {
        renderWorkshopSelectorCardList([PAST_WORKSHOP, UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);

        expect(screen.getAllByRole('button').map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
            expect.stringContaining(PAST_WORKSHOP.title),
        ]);
    });

    it('says of every workshop when it happens, where it stands, and how large its audience is', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP, PAST_WORKSHOP]);

        const [ongoingCard, upcomingCard, pastCard] = screen.getAllByRole('button');

        expect(ongoingCard.textContent).toContain('Probíhá');
        expect(ongoingCard.textContent).toContain('42 účastníků');
        expect(ongoingCard.textContent).toContain(formatWorkshopAdminDateTime(ONGOING_WORKSHOP.startsAt));
        expect(upcomingCard.textContent).toContain('Nadchází');
        expect(upcomingCard.textContent).toContain('3 účastníci');
        expect(pastCard.textContent).toContain('Proběhl');
        expect(pastCard.textContent).toContain('1 účastník');
    });

    it('marks the selected workshop and reports the one an administrator opens', () => {
        const handleSelect = vi.fn();
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, PAST_WORKSHOP], handleSelect);

        const [ongoingCard, pastCard] = screen.getAllByRole('button');

        expect(ongoingCard.getAttribute('aria-pressed')).toBe('true');
        expect(pastCard.getAttribute('aria-pressed')).toBe('false');

        fireEvent.click(pastCard);

        expect(handleSelect).toHaveBeenCalledWith(PAST_WORKSHOP.id);
    });

    it('explains an empty administration instead of listing nothing at all', () => {
        renderWorkshopSelectorCardList([]);

        expect(screen.getByText('Vytvořte první workshop.')).not.toBeNull();
        expect(screen.queryAllByRole('button')).toEqual([]);
    });
});
