'use client';

import {
    createPodcastEpisodePlaybackProgress,
    type PodcastEpisodePlayback,
    type PodcastEpisodePlaybackProgress,
} from '@/lib/podcast/podcastPlaybackProgress';
import {
    loadPodcastPlaybackProgress,
    savePodcastPlaybackProgress,
    type PodcastPlaybackProgressByEpisodeSlug,
} from '@/lib/podcast/podcastPlaybackProgressStorage';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Nothing is remembered yet, which is what the very first render of a page has to assume
 */
const EMPTY_PLAYBACK_PROGRESS: PodcastPlaybackProgressByEpisodeSlug = {};

export type UsePodcastPlaybackProgressResult = {
    /**
     * What is remembered about every episode, for a list which marks them
     */
    readonly playbackProgressByEpisodeSlug: PodcastPlaybackProgressByEpisodeSlug;

    /**
     * Whether the browser has already said what it remembers
     *
     * Note: A player which loaded an episode before this turned true has to ask again, because until then the answer
     *       to every question about that episode was that nobody ever played it. This is what a page opened straight
     *       on an episode - a shared link, or a reload of a page which was listening - resumes by.
     */
    readonly isPlaybackProgressRestored: boolean;

    /**
     * What is remembered about one episode, as it stands at this very moment
     *
     * Note: A player reads a position in the middle of an event of its audio element, where the last render can already
     *       be out of date, which is why this is a call rather than the value above. It never changes identity, so
     *       reading it cannot restart an effect of the player.
     */
    readonly getEpisodePlaybackProgress: (episodeSlug: string | null) => PodcastEpisodePlaybackProgress | null;

    /**
     * Writes down where the listener got to in one episode
     */
    readonly recordEpisodePlaybackProgress: (episodeSlug: string, playback: PodcastEpisodePlayback) => void;
};

/**
 * Remembers which episodes of a show were played, which were left in the middle and where exactly
 *
 * Note: The server renders a page without knowing what a particular browser remembers, so the progress starts empty
 *       and arrives right after the page is mounted. Reading the storage while rendering would make the two disagree.
 *
 * @param storageKey key the progress of this one show is stored under
 */
export function usePodcastPlaybackProgress(storageKey: string): UsePodcastPlaybackProgressResult {
    const [playbackProgressByEpisodeSlug, setPlaybackProgressByEpisodeSlug] =
        useState<PodcastPlaybackProgressByEpisodeSlug>(EMPTY_PLAYBACK_PROGRESS);
    const [isPlaybackProgressRestored, setIsPlaybackProgressRestored] = useState(false);

    // Note: Every change is put into the ref before it is rendered, so that a position written and a position read
    //       within one event of an audio element cannot be two different positions.
    const playbackProgressRef = useRef<PodcastPlaybackProgressByEpisodeSlug>(EMPTY_PLAYBACK_PROGRESS);

    useEffect(() => {
        // Note: What was played since this page opened wins over what the storage says, because the storage was read
        //       later than it was written.
        const restoredPlaybackProgress = {
            ...loadPodcastPlaybackProgress(storageKey),
            ...playbackProgressRef.current,
        };

        playbackProgressRef.current = restoredPlaybackProgress;
        setPlaybackProgressByEpisodeSlug(restoredPlaybackProgress);
        setIsPlaybackProgressRestored(true);
    }, [storageKey]);

    const getEpisodePlaybackProgress = useCallback(
        (episodeSlug: string | null) =>
            episodeSlug === null ? null : playbackProgressRef.current[episodeSlug] ?? null,
        [],
    );

    const recordEpisodePlaybackProgress = useCallback(
        (episodeSlug: string, playback: PodcastEpisodePlayback) => {
            const nextPlaybackProgress = {
                ...playbackProgressRef.current,
                [episodeSlug]: createPodcastEpisodePlaybackProgress(playback),
            };

            playbackProgressRef.current = nextPlaybackProgress;
            setPlaybackProgressByEpisodeSlug(nextPlaybackProgress);
            savePodcastPlaybackProgress(storageKey, nextPlaybackProgress);
        },
        [storageKey],
    );

    return {
        playbackProgressByEpisodeSlug,
        isPlaybackProgressRestored,
        getEpisodePlaybackProgress,
        recordEpisodePlaybackProgress,
    };
}
