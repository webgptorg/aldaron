import type { AiTaKrajtaArchive, AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { resolveAiTaKrajtaEpisodePersonIds } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import {
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_RSS_FEED_URL,
    AI_TA_KRAJTA_SUMMARY_STOP_PHRASES,
} from '@/businesses/ai-ta-krajta/config';
import { fetchPodcastFeed } from '@/lib/podcast/fetchPodcastFeed';
import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';

const SECONDS_PER_MINUTE = 60;

/**
 * How long an episode usually takes, which says more about the show than an average dragged by one four hour special
 */
function getMedianDurationInMinutes(episodes: readonly AiTaKrajtaEpisode[]): number | null {
    const durations = episodes
        .map((episode) => episode.durationInSeconds)
        .filter((durationInSeconds): durationInSeconds is number => durationInSeconds !== null)
        .sort((firstDuration, secondDuration) => firstDuration - secondDuration);

    if (durations.length === 0) {
        return null;
    }

    return Math.round(durations[Math.floor(durations.length / 2)] / SECONDS_PER_MINUTE);
}

/**
 * Turns one episode of the feed into the episode the page renders, leaving its whole description behind
 */
function createAiTaKrajtaEpisode(episode: PodcastEpisode): AiTaKrajtaEpisode {
    const { descriptionText, ...episodeWithoutDescription } = episode;

    return { ...episodeWithoutDescription, personIds: resolveAiTaKrajtaEpisodePersonIds(episode) };
}

/**
 * Reads the archive of the show from its podcast feed
 *
 * Note: This runs on the server, so the browser receives episodes which already know who took part in them and which
 *       no longer carry the whole description they were read out of.
 *
 * @param revalidateSeconds how long a fetched feed may be reused, which the route decides together with how long it
 *                          reuses the page built from it
 */
export async function fetchAiTaKrajtaArchive(revalidateSeconds: number): Promise<AiTaKrajtaArchive> {
    const feed = await fetchPodcastFeed({
        feedUrl: AI_TA_KRAJTA_RSS_FEED_URL,
        revalidateSeconds,
        showTitle: AI_TA_KRAJTA_NAME,
        summaryStopPhrases: AI_TA_KRAJTA_SUMMARY_STOP_PHRASES,
    });
    const episodes = feed.episodes.map(createAiTaKrajtaEpisode);

    return {
        episodes,
        firstPublishedAt: episodes[episodes.length - 1]?.publishedAt ?? null,
        medianDurationInMinutes: getMedianDurationInMinutes(episodes),
    };
}
