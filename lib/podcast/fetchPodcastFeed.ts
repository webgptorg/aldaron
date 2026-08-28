import { parsePodcastRssFeed, type ParsePodcastRssFeedOptions } from '@/lib/podcast/parsePodcastRssFeed';
import { EMPTY_PODCAST_FEED, type PodcastFeed } from '@/lib/podcast/PodcastFeed';

export type FetchPodcastFeedOptions = ParsePodcastRssFeedOptions & {
    /**
     * Address of the RSS feed of the show
     */
    readonly feedUrl: string;

    /**
     * How long a fetched feed may be reused before it is read again
     */
    readonly revalidateSeconds: number;
};

/**
 * Reads the feed of a podcast from its publisher
 *
 * Note: A page which lists episodes is a landing page first. When the publisher is unreachable or answers with
 *       something which is not a feed, the page still has to render, so the failure ends here and the caller receives
 *       a show without episodes instead of an exception.
 *
 * @returns the show with its episodes, or `EMPTY_PODCAST_FEED` when the feed could not be read
 */
export async function fetchPodcastFeed(options: FetchPodcastFeedOptions): Promise<PodcastFeed> {
    const { feedUrl, revalidateSeconds, ...parseOptions } = options;

    try {
        const response = await fetch(feedUrl, {
            headers: { Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8' },
            next: { revalidate: revalidateSeconds },
        });

        if (!response.ok) {
            console.error(`Podcast feed ${feedUrl} answered with the status ${response.status}`);
            return EMPTY_PODCAST_FEED;
        }

        return parsePodcastRssFeed(await response.text(), parseOptions);
    } catch (feedError) {
        console.error(`Podcast feed ${feedUrl} could not be read`, feedError);
        return EMPTY_PODCAST_FEED;
    }
}
