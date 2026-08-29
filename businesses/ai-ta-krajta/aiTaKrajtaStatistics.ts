import type { AiTaKrajtaEpisode, AiTaKrajtaStatistics } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import {
    AI_TA_KRAJTA_AUDIENCE_ESTIMATE_SOURCES,
    AI_TA_KRAJTA_FULL_EPISODE_EQUIVALENT_LISTENS,
} from '@/businesses/ai-ta-krajta/config';

const SECONDS_PER_HOUR = 60 * 60;
const LISTENING_HOURS_ROUNDING_STEP = 1_000;

/**
 * Adds only the durations the RSS feed actually provides, so a malformed or incomplete item cannot inflate the claim
 */
function getKnownEpisodeDurationInSeconds(episodes: readonly AiTaKrajtaEpisode[]): number {
    return episodes.reduce((totalDurationInSeconds, episode) => {
        const { durationInSeconds } = episode;

        return durationInSeconds !== null && durationInSeconds > 0
            ? totalDurationInSeconds + durationInSeconds
            : totalDurationInSeconds;
    }, 0);
}

/**
 * Keeps an estimate deliberately coarse. The plus sign in the page then reads as a lower bound, not as false precision.
 */
function roundDownListeningHours(estimatedListeningHours: number): number {
    return Math.floor(estimatedListeningHours / LISTENING_HOURS_ROUNDING_STEP) * LISTENING_HOURS_ROUNDING_STEP;
}

/**
 * Sums the documented estimates from every distribution channel instead of treating the YouTube channel as the show
 */
export function calculateAiTaKrajtaEstimatedAudienceCount(): number {
    return AI_TA_KRAJTA_AUDIENCE_ESTIMATE_SOURCES.reduce(
        (totalAudienceCount, source) => totalAudienceCount + source.minimumListenerAndSubscriberCount,
        0,
    );
}

/**
 * Estimates completed listening time from the real durations of the archive and a conservative all-platform listen count
 */
export function calculateAiTaKrajtaEstimatedListeningHours(
    episodes: readonly AiTaKrajtaEpisode[],
): number | null {
    const knownEpisodeDurationInSeconds = getKnownEpisodeDurationInSeconds(episodes);

    if (knownEpisodeDurationInSeconds === 0) {
        return null;
    }

    const estimatedListeningHours =
        (knownEpisodeDurationInSeconds * AI_TA_KRAJTA_FULL_EPISODE_EQUIVALENT_LISTENS) / SECONDS_PER_HOUR;
    const roundedListeningHours = roundDownListeningHours(estimatedListeningHours);

    return roundedListeningHours > 0 ? roundedListeningHours : null;
}

/**
 * Builds the small set of public statistics which the hero needs from the feed-driven archive
 */
export function createAiTaKrajtaStatistics(episodes: readonly AiTaKrajtaEpisode[]): AiTaKrajtaStatistics {
    return {
        estimatedAudienceCount: calculateAiTaKrajtaEstimatedAudienceCount(),
        estimatedListeningHours: calculateAiTaKrajtaEstimatedListeningHours(episodes),
    };
}
