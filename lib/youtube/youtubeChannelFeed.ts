import { convertHtmlDescriptionToPlainText } from '@/lib/text/descriptionText';
import { readXmlElements, readXmlTagAttribute, readXmlTagText } from '@/lib/xml/xmlTags';

/**
 * One video of a YouTube channel, as far as the public feed of that channel describes it
 */
export type YoutubeChannelVideo = {
    readonly videoId: string;
    readonly title: string;

    /**
     * Description under the video as plain text, with its links and hashtags removed
     */
    readonly description: string;

    /**
     * Moment the video was published, as an ISO 8601 string
     */
    readonly publishedAt: string;

    /**
     * Preview picture of the video, `null` when the feed names none
     */
    readonly thumbnailUrl: string | null;

    /**
     * Whether the video is a short rather than a full one
     *
     * Note: A channel publishes its shorts into the very same feed as everything else, and the only thing which tells
     *       them apart is the address the feed links them under.
     */
    readonly isShort: boolean;
};

/**
 * The public feed of a channel, which YouTube serves without an API key and which lists the newest videos of it
 *
 * Note: It is only ever the newest handful of videos, which is why the archive of a show is not read from here alone.
 *
 * @param channelId identifier of the channel, for example `UC5Tbrm0RPCqaye9Nf5qIYGQ`
 */
export function createYoutubeChannelFeedUrl(channelId: string): string {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

/**
 * Reads one `<entry>` of a channel feed as one video, `null` when it names no video
 */
function parseYoutubeChannelVideo(entryXml: string): YoutubeChannelVideo | null {
    const videoId = readXmlTagText(entryXml, 'yt:videoId');
    const title = readXmlTagText(entryXml, 'title');

    if (videoId === null || title === null) {
        return null;
    }

    const publishedAt = new Date(readXmlTagText(entryXml, 'published') ?? '');

    return {
        videoId,
        title,
        description: convertHtmlDescriptionToPlainText(readXmlTagText(entryXml, 'media:description') ?? ''),
        publishedAt: (Number.isNaN(publishedAt.getTime()) ? new Date(0) : publishedAt).toISOString(),
        thumbnailUrl: readXmlTagAttribute(entryXml, 'media:thumbnail', 'url'),
        isShort: (readXmlTagAttribute(entryXml, 'link', 'href') ?? '').includes('/shorts/'),
    };
}

/**
 * Reads the videos of a channel out of its public feed
 *
 * @param xml body of the channel feed
 * @returns videos of the channel, newest first
 */
export function parseYoutubeChannelFeed(xml: string): readonly YoutubeChannelVideo[] {
    return readXmlElements(xml, 'entry')
        .map(parseYoutubeChannelVideo)
        .filter((video): video is YoutubeChannelVideo => video !== null)
        .sort((firstVideo, secondVideo) => secondVideo.publishedAt.localeCompare(firstVideo.publishedAt));
}
