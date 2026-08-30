import type { PartialPodcastEpisode } from '@/lib/podcast/mergePodcastEpisodes';
import { readPodcastEpisodeNumberFromTitle } from '@/lib/podcast/podcastEpisodeIdentity';
import { createYoutubeWatchUrl } from '@/lib/youtube/youtubeEmbed';
import type { YoutubeChannelVideo } from '@/lib/youtube/youtubeChannelFeed';

export type CreatePodcastEpisodesFromYoutubeVideosOptions = {
    /**
     * Reads names which the particular show lists in a video's original description
     */
    readonly readEpisodeHostNames?: (descriptionHtml: string) => readonly string[];
};

/**
 * Whether a video of the channel is an episode of the show rather than something else published on the same channel
 *
 * Note: A channel of a numbered show carries far more than its episodes - shorts cut out of them, announcements and
 *       trailers - and every one of its episodes says its number in its title. Reading the archive from the numbered
 *       videos alone therefore keeps a promotional clip out of the list of episodes. A special published outside the
 *       numbering is not recognized here and is left to the other sources, because guessing which clip is an episode
 *       would put a thirty second trailer in front of the newest episode of the show.
 */
function isEpisodeVideo(video: YoutubeChannelVideo): boolean {
    return !video.isShort && readPodcastEpisodeNumberFromTitle(video.title) !== null;
}

/**
 * Reads what the video channel of a show knows about its episodes
 *
 * Note: A video carries the address to watch the episode at, which is the primary link of an episode, and it carries
 *       it as soon as the video is published - which is regularly before the podcast feed carries the recording.
 *
 * @param videos videos of the channel of the show
 * @returns what these videos say about the episodes of the show
 */
export function createPodcastEpisodesFromYoutubeVideos(
    videos: readonly YoutubeChannelVideo[],
    options: CreatePodcastEpisodesFromYoutubeVideosOptions = {},
): readonly PartialPodcastEpisode[] {
    return videos.filter(isEpisodeVideo).map((video) => ({
        id: `youtube:${video.videoId}`,
        number: readPodcastEpisodeNumberFromTitle(video.title),
        title: video.title,
        descriptionText: video.description,
        hosts: options.readEpisodeHostNames?.(video.descriptionHtml) ?? [],
        videoUrl: createYoutubeWatchUrl(video.videoId),
        publishedAt: video.publishedAt,
        imageUrl: video.thumbnailUrl,
    }));
}
