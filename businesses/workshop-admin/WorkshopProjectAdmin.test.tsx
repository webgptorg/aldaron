/**
 * @vitest-environment jsdom
 */

import { WorkshopProjectAdmin } from '@/businesses/workshop-admin/WorkshopProjectAdmin';
import type { WorkshopAdminProject } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const PROJECT: WorkshopAdminProject = {
    id: 'project-1',
    participantId: 'participant-1',
    authorName: 'Jana Nováková',
    title: 'Komunitní mapa',
    description: 'Interaktivní ukázka.',
    url: 'https://example.com/map',
    status: 'pending',
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
};

afterEach(cleanup);

describe('community project administration', () => {
    it('sends the approval decision through the shared admin callback', async () => {
        const onChangeStatus = vi.fn().mockResolvedValue(true);
        render(<WorkshopProjectAdmin projects={[PROJECT]} onChangeStatus={onChangeStatus} onDelete={vi.fn()} />);

        expect(screen.getByText('Čeká na schválení')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Schválit' }));

        await waitFor(() => expect(onChangeStatus).toHaveBeenCalledWith('project-1', 'approved'));
    });
});
