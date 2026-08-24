/**
 * @vitest-environment jsdom
 */

import { WorkshopPollAdmin } from '@/businesses/workshop-admin/WorkshopPollAdmin';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

describe('community poll administration', () => {
    it('sends a trimmed question and its choices through the shared admin callback', async () => {
        const onCreate = vi.fn().mockResolvedValue(true);
        render(<WorkshopPollAdmin polls={[]} onCreate={onCreate} onClose={vi.fn().mockResolvedValue(true)} />);

        fireEvent.change(screen.getByPlaceholderText(/Kterému tématu/), {
            target: { value: ' Kterému tématu se máme věnovat? ' },
        });
        fireEvent.change(screen.getByPlaceholderText('Možnost 1'), { target: { value: ' Testování ' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 2'), { target: { value: ' Nasazování ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit anketu' }));

        await waitFor(() =>
            expect(onCreate).toHaveBeenCalledWith({
                question: 'Kterému tématu se máme věnovat?',
                options: ['Testování', 'Nasazování'],
            }),
        );
    });

    it('does not submit duplicate choices that would make a poll ambiguous', () => {
        const onCreate = vi.fn();
        render(<WorkshopPollAdmin polls={[]} onCreate={onCreate} onClose={vi.fn().mockResolvedValue(true)} />);

        fireEvent.change(screen.getByPlaceholderText(/Kterému tématu/), { target: { value: 'Téma?' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 1'), { target: { value: 'Testování' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 2'), { target: { value: 'testování' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit anketu' }));

        expect(onCreate).not.toHaveBeenCalled();
        expect(screen.getByText('Každá možnost musí být jiná.')).not.toBeNull();
    });
});
