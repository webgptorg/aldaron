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
 * Rounded impact estimates which are calculated from the archive and the documented cross-platform audience model
 */
export type AiTaKrajtaStatistics = {
    /**
     * Conservative aggregate of listeners and subscribers across the distribution platforms
     */
    readonly estimatedAudienceCount: number;

    /**
     * Conservative aggregate listening time in hours, `null` when no episode carries its duration
     */
    readonly estimatedListeningHours: number | null;
};

/**
 * Everything the page needs to know about the show and its episodes
 */
export type AiTaKrajtaArchive = {
    readonly episodes: readonly AiTaKrajtaEpisode[];

    /**
     * The public impact figures drawn from the current archive and the cross-platform audience estimate
     */
    readonly statistics: AiTaKrajtaStatistics;
};
