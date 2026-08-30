/**
 * Throwaway helper which builds the archive out of the real sources, to see what the page will be given.
 *
 * Note: The archive of the page is memoized with `cache` of React, which only exists inside a server component, so
 *       this repeats the few lines around it rather than calling it.
 */
import { resolveAiTaKrajtaEpisodePersonIds } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { createAiTaKrajtaInternalEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import {
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_RSS_FEED_URL,
    AI_TA_KRAJTA_SUMMARY_STOP_PHRASES,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_ID,
} from '@/businesses/ai-ta-krajta/config';
import { fetchPodcastFeed } from '@/lib/podcast/fetchPodcastFeed';
import { mergePodcastEpisodes } from '@/lib/podcast/mergePodcastEpisodes';
import { createPodcastEpisodesFromYoutubeVideos } from '@/lib/podcast/podcastEpisodesFromYoutube';
import { fetchYoutubeChannelVideos } from '@/lib/youtube/fetchYoutubeChannelVideos';

const SHOW_CONVENTIONS = {
    showTitle: AI_TA_KRAJTA_NAME,
    summaryStopPhrases: AI_TA_KRAJTA_SUMMARY_STOP_PHRASES,
};

async function main(): Promise<void> {
    const [feed, youtubeVideos] = await Promise.all([
        fetchPodcastFeed({ feedUrl: AI_TA_KRAJTA_RSS_FEED_URL, revalidateSeconds: 3600, ...SHOW_CONVENTIONS }),
        fetchYoutubeChannelVideos({ channelId: AI_TA_KRAJTA_YOUTUBE_CHANNEL_ID, revalidateSeconds: 3600 }),
    ]);

    const youtubeEpisodes = createPodcastEpisodesFromYoutubeVideos(youtubeVideos);
    const internalEpisodes = createAiTaKrajtaInternalEpisodes();

    console.info(`feed: ${feed.episodes.length}, youtube: ${youtubeEpisodes.length} of ${youtubeVideos.length} videos, internal: ${internalEpisodes.length}`);

    const episodes = mergePodcastEpisodes(
        [feed.episodes, youtubeEpisodes, internalEpisodes],
        SHOW_CONVENTIONS,
    );

    console.info(`merged: ${episodes.length}`);
    console.info(`without video: ${episodes.filter((episode) => episode.videoUrl === null).map((episode) => episode.slug)}`);
    console.info(`without audio: ${episodes.filter((episode) => episode.audioUrl === null).map((episode) => episode.slug)}`);

    for (const episode of episodes.slice(0, 6)) {
        console.info(
            [
                `#${episode.number ?? '-'}`,
                `slug=${episode.slug}`,
                `audio=${episode.audioUrl === null ? 'no' : 'yes'}`,
                `video=${episode.videoUrl ?? 'no'}`,
                `people=${resolveAiTaKrajtaEpisodePersonIds(episode).join('+') || '-'}`,
                `title=${episode.shortTitle}`,
            ].join(' | '),
        );
    }
}

void main();
