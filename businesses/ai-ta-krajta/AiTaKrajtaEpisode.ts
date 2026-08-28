import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';

/**
 * One episode as the page works with it
 *
 * Note: The whole description is left behind on the server. Who took part in the episode has already been read out of
 *       it, and the browser has no other use for two thousand characters of links and chapter timestamps.
 */
export type AiTaKrajtaEpisode = Omit<PodcastEpisode, 'descriptionText'> & {
    /**
     * Identifiers of the people the episode names, in the order of the roster
     */
    readonly personIds: readonly string[];
};

/**
 * Everything the page needs to know about the show and its episodes
 */
export type AiTaKrajtaArchive = {
    readonly episodes: readonly AiTaKrajtaEpisode[];

    /**
     * When the show published its first episode, as an ISO 8601 string, `null` when there is no episode
     */
    readonly firstPublishedAt: string | null;

    /**
     * How long an episode usually takes, rounded to whole minutes, `null` when no episode states its length
     */
    readonly medianDurationInMinutes: number | null;
};
