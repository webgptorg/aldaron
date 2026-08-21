/**
 * @vitest-environment jsdom
 */

import { WorkshopReactions } from '@/businesses/online-workshop/participant/WorkshopReactions';
import type { WorkshopReactionCount } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const REACTIONS = ['👍', '👏', '</>'];
const REACTION_COUNTS: readonly WorkshopReactionCount[] = [
    { emoji: '👍', count: 3 },
    { emoji: '👏', count: 12 },
];

function renderWorkshopReactions(
    reactionCounts: readonly WorkshopReactionCount[] = REACTION_COUNTS,
    onReact = vi.fn().mockResolvedValue(undefined),
) {
    return {
        onReact,
        ...render(
            <WorkshopReactions
                emojis={REACTIONS}
                reactionCounts={reactionCounts}
                isInteractionBanned={false}
                onReact={onReact}
            />,
        ),
    };
}

describe('workshop reactions', () => {
    afterEach(cleanup);

    it('shows every offered reaction with its total, including an action not sent yet', () => {
        renderWorkshopReactions();

        expect(screen.getByRole('button', { name: 'Reagovat 👍; počet reakcí 3' })).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Reagovat 👏; počet reakcí 12' })).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Reagovat </>; počet reakcí 0' })).not.toBeNull();
    });

    it('sends the reaction whose total is displayed', async () => {
        const { onReact } = renderWorkshopReactions();

        fireEvent.click(screen.getByRole('button', { name: 'Reagovat 👏; počet reakcí 12' }));

        await waitFor(() => expect(onReact).toHaveBeenCalledWith('👏'));
    });
});
