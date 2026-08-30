/**
 * @vitest-environment jsdom
 */

import { usePodcastPlaybackProgress } from '@/hooks/usePodcastPlaybackProgress';
import { getPodcastEpisodeResumePositionInSeconds } from '@/lib/podcast/podcastPlaybackProgress';
import { loadPodcastPlaybackProgress } from '@/lib/podcast/podcastPlaybackProgressStorage';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const STORAGE_KEY = 'promptbook.test-playback-progress.v1';
const EPISODE_SLUG = '64';

afterEach(() => {
    cleanup();
    localStorage.clear();
});

describe('remembered podcast playback progress', () => {
    it('knows nothing before the browser has said what it remembers', () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                [EPISODE_SLUG]: {
                    positionInSeconds: 600,
                    durationInSeconds: 1800,
                    isPlayed: false,
                    updatedAt: Date.now(),
                },
            }),
        );

        const { result } = renderHook(() => usePodcastPlaybackProgress(STORAGE_KEY));

        // Note: The hook is mounted and its effect has already run here, which is what the restored flag says. A
        //       player which asked earlier than that is the reason the flag exists at all.
        expect(result.current.isPlaybackProgressRestored).toBe(true);
        expect(result.current.getEpisodePlaybackProgress(EPISODE_SLUG)?.positionInSeconds).toBe(600);
        expect(getPodcastEpisodeResumePositionInSeconds(result.current.getEpisodePlaybackProgress(EPISODE_SLUG))).toBe(
            595,
        );
    });

    it('opens an archive nobody ever played as unremembered', () => {
        const { result } = renderHook(() => usePodcastPlaybackProgress(STORAGE_KEY));

        expect(result.current.playbackProgressByEpisodeSlug).toEqual({});
        expect(result.current.getEpisodePlaybackProgress(EPISODE_SLUG)).toBeNull();
        expect(result.current.getEpisodePlaybackProgress(null)).toBeNull();
    });

    it('writes a recorded position down for the next visit and answers with it right away', () => {
        const { result } = renderHook(() => usePodcastPlaybackProgress(STORAGE_KEY));

        act(() =>
            result.current.recordEpisodePlaybackProgress(EPISODE_SLUG, {
                positionInSeconds: 420,
                durationInSeconds: 1800,
                isEnded: false,
            }),
        );

        expect(result.current.getEpisodePlaybackProgress(EPISODE_SLUG)?.positionInSeconds).toBe(420);
        expect(result.current.playbackProgressByEpisodeSlug[EPISODE_SLUG]?.positionInSeconds).toBe(420);
        expect(loadPodcastPlaybackProgress(STORAGE_KEY)[EPISODE_SLUG]?.positionInSeconds).toBe(420);
    });

    it('keeps what was played apart episode by episode', () => {
        const { result } = renderHook(() => usePodcastPlaybackProgress(STORAGE_KEY));

        act(() => {
            result.current.recordEpisodePlaybackProgress(EPISODE_SLUG, {
                positionInSeconds: 420,
                durationInSeconds: 1800,
                isEnded: false,
            });
            result.current.recordEpisodePlaybackProgress('63', {
                positionInSeconds: 1800,
                durationInSeconds: 1800,
                isEnded: true,
            });
        });

        expect(result.current.getEpisodePlaybackProgress(EPISODE_SLUG)?.isPlayed).toBe(false);
        expect(result.current.getEpisodePlaybackProgress('63')?.isPlayed).toBe(true);
    });
});
