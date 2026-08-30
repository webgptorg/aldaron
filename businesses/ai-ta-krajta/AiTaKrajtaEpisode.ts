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
 * One episode there really is a recording of, which is the only kind the mini player can be given
 *
 * Note: The video of an episode is regularly published before its recording is, so an episode of the archive is not
 *       necessarily playable. Saying that in the type keeps the player from having to check it again.
 */
export type PlayableAiTaKrajtaEpisode = AiTaKrajtaEpisode & { readonly audioUrl: string };

/**
 * Whether there is a recording of this episode to play
 */
export function isPlayableAiTaKrajtaEpisode(episode: AiTaKrajtaEpisode): episode is PlayableAiTaKrajtaEpisode {
    return episode.audioUrl !== null;
}

/**
 * Rounded, cross-platform reach estimates the server derived from the public profiles and the merged archive.
 */
export type AiTaKrajtaAudienceStatistics = {
    /**
     * Public subscriptions, follows and reviews summed across platforms, `null` when every count source is unreadable
     */
    readonly estimatedSubscriberCount: number | null;

    /**
     * Conservative estimate of time played across video and published audio homes, in whole hours
     */
    readonly estimatedListeningHours: number | null;
};

/**
 * Everything the page needs to know about the show and its episodes
 */
export type AiTaKrajtaArchive = {
    readonly episodes: readonly AiTaKrajtaEpisode[];

    /**
     * Cross-platform reach estimates, already aggregated on the server instead of from a browser request
     */
    readonly statistics: AiTaKrajtaAudienceStatistics;

    /**
     * When the show published its first episode, as an ISO 8601 string, `null` when there is no episode
     */
    readonly firstPublishedAt: string | null;

    /**
     * How long an episode usually takes, rounded to whole minutes, `null` when no episode states its length
     */
    readonly medianDurationInMinutes: number | null;
};
