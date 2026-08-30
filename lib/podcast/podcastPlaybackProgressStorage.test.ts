/**
 * @vitest-environment jsdom
 */

import type { PodcastEpisodePlaybackProgress } from '@/lib/podcast/podcastPlaybackProgress';
import {
    loadPodcastPlaybackProgress,
    savePodcastPlaybackProgress,
} from '@/lib/podcast/podcastPlaybackProgressStorage';
import { afterEach, describe, expect, it } from 'vitest';

const STORAGE_KEY = 'promptbook.test-playback-progress.v1';

function createProgress(progress: Partial<PodcastEpisodePlaybackProgress> = {}): PodcastEpisodePlaybackProgress {
    return {
        positionInSeconds: 600,
        durationInSeconds: 1800,
        isPlayed: false,
        updatedAt: Date.parse('2026-08-30T12:00:00.000Z'),
        ...progress,
    };
}

afterEach(() => localStorage.clear());

describe('podcast playback progress storage', () => {
    it('gives back what the listener left behind', () => {
        const progressByEpisodeSlug = { '64': createProgress(), '63': createProgress({ isPlayed: true }) };

        savePodcastPlaybackProgress(STORAGE_KEY, progressByEpisodeSlug);

        expect(loadPodcastPlaybackProgress(STORAGE_KEY)).toEqual(progressByEpisodeSlug);
    });

    it('remembers nothing about a show which was never played', () => {
        expect(loadPodcastPlaybackProgress(STORAGE_KEY)).toEqual({});
    });

    it('keeps the readable episodes of a value which is partly unreadable', () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ '64': createProgress(), '63': { positionInSeconds: 'half of it' } }),
        );

        expect(loadPodcastPlaybackProgress(STORAGE_KEY)).toEqual({ '64': createProgress() });
    });

    it('answers a value which is no progress at all with an archive nobody played', () => {
        localStorage.setItem(STORAGE_KEY, 'not json at all');

        expect(loadPodcastPlaybackProgress(STORAGE_KEY)).toEqual({});
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('keeps the episodes which were played most recently rather than growing without an end', () => {
        const progressByEpisodeSlug = Object.fromEntries(
            Array.from({ length: 600 }, (_unused, episodeIndex) => [
                String(episodeIndex),
                createProgress({ updatedAt: episodeIndex }),
            ]),
        );

        savePodcastPlaybackProgress(STORAGE_KEY, progressByEpisodeSlug);

        const storedProgress = loadPodcastPlaybackProgress(STORAGE_KEY);

        expect(Object.keys(storedProgress)).toHaveLength(500);
        expect(storedProgress['599']).toBeDefined();
        expect(storedProgress['99']).toBeUndefined();
    });
});
