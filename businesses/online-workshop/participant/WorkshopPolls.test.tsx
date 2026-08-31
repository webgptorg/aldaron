/**
 * @vitest-environment jsdom
 */

import { WorkshopPolls } from '@/businesses/online-workshop/participant/WorkshopPolls';
import type { WorkshopPoll } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const POLL: WorkshopPoll = {
    id: 'poll-1',
    question: 'Kterému tématu se máme věnovat?',
    isClosed: false,
    isVisible: true,
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    options: [
        { id: 'option-1', label: 'Testování', sortOrder: 0, voteCount: 3, isVotedByParticipant: true },
        { id: 'option-2', label: 'Nasazování', sortOrder: 1, voteCount: 1, isVotedByParticipant: false },
    ],
    attachedWorkshops: [],
};

afterEach(cleanup);

describe('community polls', () => {
    it('shows only aggregate results and lets a member change their own choice', async () => {
        const onVote = vi.fn().mockResolvedValue(true);
        render(<WorkshopPolls polls={[POLL]} isInteractionBanned={false} onVote={onVote} />);

        expect(screen.getByText('Kterému tématu se máme věnovat?')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Testování/ }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByText('3 · 75 %')).not.toBeNull();
        expect(screen.getByText('1 · 25 %')).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Nasazování/ }));

        await waitFor(() => expect(onVote).toHaveBeenCalledWith('poll-1', 'option-2'));
    });

    it('keeps the result readable but disables a closed poll and a banned member', () => {
        const onVote = vi.fn();
        const { rerender } = render(<WorkshopPolls polls={[{ ...POLL, isClosed: true }]} isInteractionBanned={false} onVote={onVote} />);

        expect(screen.getByRole('button', { name: /Testování/ }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('Hlasování skončilo')).not.toBeNull();

        rerender(<WorkshopPolls polls={[POLL]} isInteractionBanned={true} onVote={onVote} />);

        expect(screen.getByRole('button', { name: /Nasazování/ }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('Pro tento účet nejsou interakce dostupné.')).not.toBeNull();
    });

    it('shows an attached poll as a read-only community result', () => {
        render(<WorkshopPolls polls={[POLL]} isInteractionBanned={false} />);

        expect(screen.getByText('Kterému tématu se máme věnovat?')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Testování/ }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('Tato anketa patří komunitě; zde se zobrazuje její průběžný výsledek.')).not.toBeNull();
    });
});
