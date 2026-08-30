import {
    readBrowserLocalStorageItem,
    removeBrowserLocalStorageItem,
    writeBrowserLocalStorageItem,
} from '@/lib/browser/browserStorage';
import {
    isPodcastEpisodePlaybackProgress,
    type PodcastEpisodePlaybackProgress,
} from '@/lib/podcast/podcastPlaybackProgress';

/**
 * What a browser remembers about a whole show, one entry per episode slug
 */
export type PodcastPlaybackProgressByEpisodeSlug = Readonly<Record<string, PodcastEpisodePlaybackProgress>>;

/**
 * How many episodes one show remembers the progress of
 *
 * Note: A weekly show takes years to reach this, but the browser must not be asked to store more and more of something
 *       nobody listens to twice. What falls out is what was played longest ago.
 */
const PODCAST_PLAYBACK_PROGRESS_MAX_EPISODE_COUNT = 500;

/**
 * Nothing is remembered yet, which is also what an unreadable storage answers with
 */
const EMPTY_PODCAST_PLAYBACK_PROGRESS: PodcastPlaybackProgressByEpisodeSlug = {};

/**
 * Keeps the episodes which were played most recently, so that the stored value cannot grow without an end
 */
function limitPodcastPlaybackProgress(
    progressByEpisodeSlug: PodcastPlaybackProgressByEpisodeSlug,
): PodcastPlaybackProgressByEpisodeSlug {
    const entries = Object.entries(progressByEpisodeSlug);

    if (entries.length <= PODCAST_PLAYBACK_PROGRESS_MAX_EPISODE_COUNT) {
        return progressByEpisodeSlug;
    }

    return Object.fromEntries(
        entries
            .sort(([, progress], [, otherProgress]) => otherProgress.updatedAt - progress.updatedAt)
            .slice(0, PODCAST_PLAYBACK_PROGRESS_MAX_EPISODE_COUNT),
    );
}

/**
 * Reads what this browser remembers about the episodes of one show
 *
 * Note: A single unreadable entry is dropped instead of the whole archive of progress, so one value written by an
 *       older version of the page cannot cost a listener every position they left an episode at.
 *
 * @param storageKey key the progress of this one show is stored under
 */
export function loadPodcastPlaybackProgress(storageKey: string): PodcastPlaybackProgressByEpisodeSlug {
    const storedProgress = readBrowserLocalStorageItem(storageKey);

    if (storedProgress === null) {
        return EMPTY_PODCAST_PLAYBACK_PROGRESS;
    }

    let parsedProgress: unknown;

    try {
        parsedProgress = JSON.parse(storedProgress);
    } catch {
        removeBrowserLocalStorageItem(storageKey);
        return EMPTY_PODCAST_PLAYBACK_PROGRESS;
    }

    if (typeof parsedProgress !== 'object' || parsedProgress === null || Array.isArray(parsedProgress)) {
        removeBrowserLocalStorageItem(storageKey);
        return EMPTY_PODCAST_PLAYBACK_PROGRESS;
    }

    return Object.fromEntries(
        Object.entries(parsedProgress).filter(([episodeSlug, progress]) => {
            return episodeSlug !== '' && isPodcastEpisodePlaybackProgress(progress);
        }),
    ) as PodcastPlaybackProgressByEpisodeSlug;
}

/**
 * Asks this browser to remember where the listener left the episodes of one show
 *
 * @param storageKey key the progress of this one show is stored under
 * @param progressByEpisodeSlug everything which is known about the episodes of the show
 */
export function savePodcastPlaybackProgress(
    storageKey: string,
    progressByEpisodeSlug: PodcastPlaybackProgressByEpisodeSlug,
): void {
    writeBrowserLocalStorageItem(storageKey, JSON.stringify(limitPodcastPlaybackProgress(progressByEpisodeSlug)));
}
