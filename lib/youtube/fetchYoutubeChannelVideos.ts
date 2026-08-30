import { fetchCachedText } from '@/lib/network/fetchCachedText';
import {
    createYoutubeChannelFeedUrl,
    parseYoutubeChannelFeed,
    type YoutubeChannelVideo,
} from '@/lib/youtube/youtubeChannelFeed';

export type FetchYoutubeChannelVideosOptions = {
    /**
     * Identifier of the channel, for example `UC5Tbrm0RPCqaye9Nf5qIYGQ`
     */
    readonly channelId: string;

    /**
     * How long a fetched feed may be reused before it is read again
     */
    readonly revalidateSeconds: number;
};

/**
 * Every kind of document YouTube answers a request for a channel feed with
 */
const CHANNEL_FEED_MEDIA_TYPES = 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8';

/**
 * Reads the newest videos of a YouTube channel
 *
 * Note: A page which lists videos has to render even when YouTube is unreachable, so the caller receives no video
 *       instead of an exception.
 *
 * @returns videos of the channel, newest first, an empty list when the feed could not be read
 */
export async function fetchYoutubeChannelVideos(
    options: FetchYoutubeChannelVideosOptions,
): Promise<readonly YoutubeChannelVideo[]> {
    const feedXml = await fetchCachedText({
        url: createYoutubeChannelFeedUrl(options.channelId),
        revalidateSeconds: options.revalidateSeconds,
        acceptedMediaTypes: CHANNEL_FEED_MEDIA_TYPES,
    });

    return feedXml === null ? [] : parseYoutubeChannelFeed(feedXml);
}
