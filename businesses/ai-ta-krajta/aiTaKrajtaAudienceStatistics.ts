import type { AiTaKrajtaAudienceStatistics, AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import type { AiTaKrajtaPublicPlatformStatistics } from '@/businesses/ai-ta-krajta/aiTaKrajtaPublicPlatformStatistics';

const SECONDS_PER_HOUR = 60 * 60;
const ESTIMATED_YOUTUBE_EPISODE_PLAYTHROUGH_RATIO = 0.35;
const ESTIMATED_AUDIO_LISTENING_HOURS_RATIO_PER_PLATFORM = 0.15;

/**
 * Adds the non-null public audience counts without turning a missing source into a zero.
 */
function sumPublicAudienceCounts(counts: readonly (number | null)[]): number | null {
    const knownCounts = counts.filter((count): count is number => count !== null);

    return knownCounts.length === 0 ? null : knownCounts.reduce((total, count) => total + count, 0);
}

/**
 * Finds the mean recording length of the merged archive, omitting episodes for which no source knows it.
 */
function getAverageEpisodeDurationInSeconds(episodes: readonly AiTaKrajtaEpisode[]): number | null {
    const knownDurations = episodes
        .map((episode) => episode.durationInSeconds)
        .filter((durationInSeconds): durationInSeconds is number => durationInSeconds !== null);

    if (knownDurations.length === 0) {
        return null;
    }

    return knownDurations.reduce((total, durationInSeconds) => total + durationInSeconds, 0) / knownDurations.length;
}

/**
 * Counts the audio services whose public show page confirmed that the feed is actually published there.
 */
function getAvailableAudioPlatformCount(platformStatistics: AiTaKrajtaPublicPlatformStatistics): number {
    return [platformStatistics.isSpotifyShowAvailable, platformStatistics.isApplePodcastsShowAvailable].filter(
        (isPlatformAvailable) => isPlatformAvailable,
    ).length;
}

/**
 * Counts only archive entries which are actually linked to a YouTube video, rather than assuming every audio release
 * had a video version.
 */
function getYoutubeEpisodeCount(episodes: readonly AiTaKrajtaEpisode[]): number {
    return episodes.filter((episode) => episode.videoUrl !== null).length;
}

/**
 * Estimates how many of the channel's views belong to long-form show episodes rather than trailers, shorts and posts.
 */
function getEstimatedYoutubeEpisodeViewCount(
    episodeCount: number,
    platformStatistics: AiTaKrajtaPublicPlatformStatistics,
): number | null {
    const { youtubeViewCount, youtubeVideoCount } = platformStatistics;

    if (youtubeViewCount === null) {
        return null;
    }

    if (youtubeVideoCount === null || youtubeVideoCount === 0) {
        return youtubeViewCount;
    }

    return youtubeViewCount * Math.min(1, episodeCount / youtubeVideoCount);
}

/**
 * Estimates the cumulative time the show has been played across its video and published audio homes.
 *
 * The public platforms do not expose private analytics such as completion rate, Spotify plays or Apple listens. The
 * estimate consequently starts with the visible channel views, uses the actual mean duration of the merged archive,
 * conservatively assumes a 35% YouTube playthrough, then adds 15% for each verified audio home. The page labels this
 * as an estimate rather than presenting it as private platform analytics.
 */
function getEstimatedListeningHours(
    episodes: readonly AiTaKrajtaEpisode[],
    platformStatistics: AiTaKrajtaPublicPlatformStatistics,
): number | null {
    const averageEpisodeDurationInSeconds = getAverageEpisodeDurationInSeconds(episodes);
    const estimatedYoutubeEpisodeViewCount = getEstimatedYoutubeEpisodeViewCount(
        getYoutubeEpisodeCount(episodes),
        platformStatistics,
    );

    if (averageEpisodeDurationInSeconds === null || estimatedYoutubeEpisodeViewCount === null) {
        return null;
    }

    const estimatedYoutubeListeningHours =
        (estimatedYoutubeEpisodeViewCount *
            averageEpisodeDurationInSeconds *
            ESTIMATED_YOUTUBE_EPISODE_PLAYTHROUGH_RATIO) /
        SECONDS_PER_HOUR;
    const estimatedAudioListeningHours =
        estimatedYoutubeListeningHours *
        getAvailableAudioPlatformCount(platformStatistics) *
        ESTIMATED_AUDIO_LISTENING_HOURS_RATIO_PER_PLATFORM;

    return Math.round(estimatedYoutubeListeningHours + estimatedAudioListeningHours);
}

/**
 * Builds the small, client-safe summary of the podcast's cross-platform reach.
 *
 * Note: The subscriber total is a deliberately non-deduplicated aggregate of the public subscriptions, follows and
 * Apple reviews. It is useful as a conservative cross-platform signal, but cannot claim to be a count of distinct
 * people because a listener can follow the show in more than one place.
 */
export function createAiTaKrajtaAudienceStatistics(
    episodes: readonly AiTaKrajtaEpisode[],
    platformStatistics: AiTaKrajtaPublicPlatformStatistics,
): AiTaKrajtaAudienceStatistics {
    return {
        estimatedSubscriberCount: sumPublicAudienceCounts([
            platformStatistics.youtubeSubscriberCount,
            platformStatistics.linkedInFollowerCount,
            platformStatistics.instagramFollowerCount,
            platformStatistics.applePodcastReviewCount,
        ]),
        estimatedListeningHours: getEstimatedListeningHours(episodes, platformStatistics),
    };
}
