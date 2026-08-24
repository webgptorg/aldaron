/**
 * @vitest-environment jsdom
 */

import type { SubscribeToWorkshopReactions } from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import type { FlyingWorkshopReaction } from '@/lib/workshops/workshopReactionAnimations';
import type { WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
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

const WORKSHOP_WITH_VIDEO: WorkshopDetails = {
    ...WORKSHOP,
    youtubeVideoId: 'dQw4w9WgXcQ',
};

const FOLLOW_UP_CONTENT: WorkshopContentBlock = {
    id: 'follow-up-material',
    title: 'Materiály pro další krok',
    bodyMarkdown: '[Otevřít](https://example.com/materialy)',
    unlockAt: '2026-08-20T19:00:00+02:00',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: true,
    createdAt: '2026-08-20T18:00:00+02:00',
    updatedAt: '2026-08-20T18:00:00+02:00',
    linkClickCount: 0,
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

    it('offers the active video in fullscreen mode', () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );
        const videoFrame = container.querySelector('iframe');
        const requestFullscreen = vi.fn().mockResolvedValue(undefined);

        expect(videoFrame).not.toBeNull();
        Object.defineProperty(videoFrame, 'requestFullscreen', { value: requestFullscreen });

        expect(videoFrame?.getAttribute('allow')).toContain('fullscreen');
        expect(videoFrame?.allowFullscreen).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Přehrát video na celé obrazovce' }));

        expect(requestFullscreen).toHaveBeenCalledOnce();
    });

    it('takes the subtitles away from the video it plays', () => {
        const reactionSource = createReactionSource();
        const postMessage = vi.fn();
        const contentWindowSpy = vi
            .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
            .mockReturnValue({ postMessage } as unknown as Window);

        render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        expect(postMessage.mock.calls.map(([message]) => JSON.parse(message as string))).toEqual([
            { event: 'command', func: 'unloadModule', args: ['captions'] },
            { event: 'command', func: 'unloadModule', args: ['cc'] },
        ]);

        contentWindowSpy.mockRestore();
    });

    it('says nothing to a player of a workshop which has not started', () => {
        const reactionSource = createReactionSource();
        const postMessage = vi.fn();
        const contentWindowSpy = vi
            .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
            .mockReturnValue({ postMessage } as unknown as Window);

        render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T18:50:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        expect(postMessage).not.toHaveBeenCalled();

        contentWindowSpy.mockRestore();
    });

    it('replaces the video with the wrap-up while reactions keep their stage stream', () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T20:31:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                feedback={null}
                followUpContentBlock={FOLLOW_UP_CONTENT}
                onSaveFeedback={async () => true}
            />,
        );

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).not.toBeNull();
        expect(screen.getByRole('link', { name: /Materiály pro další krok/ }).getAttribute('href')).toBe(
            '#workshop-material-follow-up-material',
        );
        expect(reactionSource.listenerCount()).toBe(1);
    });
});
