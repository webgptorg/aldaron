/**
 * @vitest-environment jsdom
 */

import { WorkshopSettingsForm } from '@/businesses/workshop-admin/WorkshopSettingsForm';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    youtubeVideoId: 'dQw4w9WgXcQ',
    isPublished: true,
    allowedReactions: ['👍', '❤️'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

const COMMUNITY: WorkshopDetails = {
    ...WORKSHOP,
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    slug: 'komunita',
    title: 'Komunita Promptbooku',
    description: 'Společný prostor pro účastníky workshopů Promptbooku.',
    youtubeVideoId: null,
};

const SCHEDULE_LABELS = ['Začátek', 'Konec'];
const STAGE_LABEL = 'YouTube URL nebo video ID';
const REACTION_LABEL = 'Reakce oddělené mezerou';

function renderWorkshopSettingsForm(workshop: WorkshopDetails, onSave = vi.fn().mockResolvedValue(true)) {
    const { container } = render(<WorkshopSettingsForm workshop={workshop} onSave={onSave} />);

    return {
        onSave,
        submit: () => fireEvent.submit(container.querySelector('form') as HTMLFormElement),
    };
}

afterEach(cleanup);

describe('workshop settings form', () => {
    it('offers a workshop occurrence its schedule, its stage, and its reactions', () => {
        renderWorkshopSettingsForm(WORKSHOP);

        SCHEDULE_LABELS.forEach((scheduleLabel) => expect(screen.queryByText(scheduleLabel)).not.toBeNull());
        expect(screen.queryByText(STAGE_LABEL)).not.toBeNull();
        expect(screen.queryByText(REACTION_LABEL)).not.toBeNull();
        expect(screen.queryByText('Počet sledujících')).not.toBeNull();
    });

    it('leaves a permanent room without a schedule, a stage, and the panels only a live room keeps up to date', () => {
        renderWorkshopSettingsForm(COMMUNITY);

        SCHEDULE_LABELS.forEach((scheduleLabel) => expect(screen.queryByText(scheduleLabel)).toBeNull());
        expect(screen.queryByText(STAGE_LABEL)).toBeNull();
        expect(screen.queryByText(REACTION_LABEL)).toBeNull();
        expect(screen.queryByText('Reakce účastníků')).toBeNull();
        expect(screen.queryByText('Počet sledujících')).toBeNull();
        expect(screen.queryByText('Chat')).not.toBeNull();
    });

    it('does not ask a permanent room for the URL it was given once and for all', () => {
        renderWorkshopSettingsForm(COMMUNITY);

        expect(screen.queryByDisplayValue(COMMUNITY.slug)).toBeNull();
    });

    it('keeps the URL of a workshop occurrence editable', () => {
        renderWorkshopSettingsForm(WORKSHOP);

        expect(screen.getByDisplayValue(WORKSHOP.slug).hasAttribute('readonly')).toBe(false);
    });

    it('saves a permanent room without sending settings its kind does not have', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(COMMUNITY);

        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith({
                title: COMMUNITY.title,
                description: COMMUNITY.description,
                isPublished: COMMUNITY.isPublished,
                disabledPanels: COMMUNITY.disabledPanels,
            }),
        );
    });

    it('saves a workshop occurrence with its schedule, its stage, and its reactions', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(WORKSHOP);

        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    startsAt: expect.any(String),
                    endsAt: expect.any(String),
                    youtubeVideoId: WORKSHOP.youtubeVideoId,
                    allowedReactions: WORKSHOP.allowedReactions,
                }),
            ),
        );
    });
});
