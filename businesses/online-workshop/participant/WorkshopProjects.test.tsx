/**
 * @vitest-environment jsdom
 */

import { WorkshopProjects } from '@/businesses/online-workshop/participant/WorkshopProjects';
import type { WorkshopProject } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const PROJECTS: readonly WorkshopProject[] = [
    {
        id: 'project-approved',
        authorName: 'Adam Novák',
        title: 'Průvodce výsadbou',
        description: 'Malý pomocník pro plánování zahrady.',
        url: 'https://example.com/garden',
        status: 'approved',
        createdAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        isAuthoredByParticipant: false,
    },
    {
        id: 'project-pending',
        authorName: 'Jana Nováková',
        title: 'Můj prototyp',
        description: '',
        url: null,
        status: 'pending',
        createdAt: '2026-08-24T11:00:00.000Z',
        updatedAt: '2026-08-24T11:00:00.000Z',
        isAuthoredByParticipant: true,
    },
];

afterEach(cleanup);

describe('community projects', () => {
    it('shows a safe approved project card and tells only its author about a pending project', () => {
        render(<WorkshopProjects projects={PROJECTS} isInteractionBanned={false} onSubmit={vi.fn()} />);

        expect(screen.getByText('Průvodce výsadbou')).not.toBeNull();
        expect(screen.getByText('Sdílí Adam Novák')).not.toBeNull();
        expect(screen.getByRole('link', { name: /example\.com/ }).getAttribute('href')).toBe(
            'https://example.com/garden',
        );
        expect(screen.getByText('Můj prototyp')).not.toBeNull();
        expect(screen.getByText('Čeká na schválení')).not.toBeNull();
    });

    it('sends one trimmed link-first project through the shared participant callback', async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);
        render(<WorkshopProjects projects={[]} isInteractionBanned={false} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByPlaceholderText(/Pomocník pro plánování/), {
            target: { value: ' Zahradní pomocník ' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Co jste vytvořili/), {
            target: { value: ' Rychlý prototyp pro sousedy. ' },
        });
        fireEvent.change(screen.getByPlaceholderText('https://…'), {
            target: { value: ' https://example.com/garden ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Sdílet projekt' }));

        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith({
                title: 'Zahradní pomocník',
                description: 'Rychlý prototyp pro sousedy.',
                url: 'https://example.com/garden',
            }),
        );
    });

    it('keeps the gallery readable but takes the form away from a banned member', () => {
        render(<WorkshopProjects projects={PROJECTS} isInteractionBanned onSubmit={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Sdílet projekt' }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('Pro tento účet nejsou interakce dostupné.')).not.toBeNull();
        expect(screen.getByText('Průvodce výsadbou')).not.toBeNull();
    });
});
