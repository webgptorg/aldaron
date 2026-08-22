/**
 * @vitest-environment jsdom
 */

import { WorkshopParticipantBadge } from '@/businesses/online-workshop/participant/WorkshopParticipantBadge';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function renderBadge(
    onChangeFullname: (fullname: string) => Promise<boolean>,
    isInteractionBanned = false,
    isModerating = false,
) {
    return render(
        <WorkshopParticipantBadge
            fullname="Karel Novák"
            isInteractionBanned={isInteractionBanned}
            isModerating={isModerating}
            isRefreshing={false}
            onChangeFullname={onChangeFullname}
        />,
    );
}

function openRenameForm() {
    fireEvent.click(screen.getByRole('button', { name: 'Změnit jméno' }));
    return screen.getByRole('textbox', { name: 'Vaše jméno' });
}

describe('workshop participant badge', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows the connected name and prefills the rename form with it', () => {
        renderBadge(vi.fn());

        expect(screen.getByText(/Připojen\/a jako/).textContent).toBe('Připojen/a jako Karel Novák');
        expect(openRenameForm()).toHaveProperty('value', 'Karel Novák');
    });

    it('saves the new name and closes the rename form', async () => {
        const onChangeFullname = vi.fn().mockResolvedValue(true);
        renderBadge(onChangeFullname);

        fireEvent.change(openRenameForm(), { target: { value: '  Karel Novotný  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Uložit jméno' }));

        expect(onChangeFullname).toHaveBeenCalledWith('  Karel Novotný  ');
        await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Vaše jméno' })).toBeNull());
    });

    it('keeps the rename form open with the typed name when saving fails', async () => {
        const onChangeFullname = vi.fn().mockResolvedValue(false);
        renderBadge(onChangeFullname);

        fireEvent.change(openRenameForm(), { target: { value: 'Karel Novotný' } });
        fireEvent.click(screen.getByRole('button', { name: 'Uložit jméno' }));

        await waitFor(() => expect(onChangeFullname).toHaveBeenCalledTimes(1));
        expect(screen.getByRole('textbox', { name: 'Vaše jméno' })).toHaveProperty('value', 'Karel Novotný');
    });

    it('refuses to save a blank name', () => {
        const onChangeFullname = vi.fn();
        renderBadge(onChangeFullname);

        fireEvent.change(openRenameForm(), { target: { value: '   ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Uložit jméno' }));

        expect(onChangeFullname).not.toHaveBeenCalled();
    });

    it('gives up the rename on cancel and on Escape', () => {
        const onChangeFullname = vi.fn();
        renderBadge(onChangeFullname);

        fireEvent.change(openRenameForm(), { target: { value: 'Karel Novotný' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zrušit změnu jména' }));
        expect(screen.getByText(/Připojen\/a jako/).textContent).toBe('Připojen/a jako Karel Novák');

        fireEvent.keyDown(openRenameForm(), { key: 'Escape' });

        expect(screen.queryByRole('textbox', { name: 'Vaše jméno' })).toBeNull();
        expect(onChangeFullname).not.toHaveBeenCalled();
    });

    it('does not offer renaming to a participant who may not interact', () => {
        renderBadge(vi.fn(), true);

        expect(screen.queryByRole('button', { name: 'Změnit jméno' })).toBeNull();
        expect(screen.getByText(/Připojen\/a jako/).textContent).toBe('Připojen/a jako Karel Novák');
    });

    it('says who moderates the room, and says nothing about anybody else', () => {
        renderBadge(vi.fn(), false, true);
        expect(screen.queryByText('Moderátor')).not.toBeNull();

        cleanup();
        renderBadge(vi.fn());

        expect(screen.queryByText('Moderátor')).toBeNull();
    });
});
