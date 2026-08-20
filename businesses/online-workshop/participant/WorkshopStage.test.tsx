/**
 * @vitest-environment jsdom
 */

import type { SubscribeToWorkshopReactions } from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import type { FlyingWorkshopReaction } from '@/lib/workshops/workshopReactionAnimations';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    slug: 'online-workshop-2026-08-20',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    youtubeVideoId: null,
    isPublished: true,
    allowedReactions: ['👍'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

/**
 * The room as far as the stage is concerned: something which tells it about a reaction
 */
function createReactionSource() {
    const listeners = new Set<(reaction: FlyingWorkshopReaction) => void>();
    const subscribeToReactions: SubscribeToWorkshopReactions = (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    return {
        subscribeToReactions,
        listenerCount: () => listeners.size,
        sendReaction: (reaction: FlyingWorkshopReaction) =>
            act(() => {
                listeners.forEach((listener) => listener(reaction));
            }),
    };
}

afterEach(cleanup);

describe('workshop stage', () => {
    it('sends a reaction of the room over the stage', async () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        expect(reactionSource.listenerCount()).toBe(1);
        await reactionSource.sendReaction({ flightId: 'first', reactionText: '🎉' });
        await waitFor(() => expect(container.querySelectorAll('.workshop-reaction')).toHaveLength(1));
        expect(container.querySelector('.workshop-reaction')?.className).toContain('workshop-reaction-flight--launch');
    });

    it('stops listening once the room leaves the stage', () => {
        const reactionSource = createReactionSource();
        const { unmount } = render(
            <WorkshopStage
                workshop={WORKSHOP}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        unmount();
        expect(reactionSource.listenerCount()).toBe(0);
    });
});
