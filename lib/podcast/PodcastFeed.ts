/**
 * One episode of a podcast, as it is published in an RSS feed
 *
 * Note: Everything here comes straight from the feed, so a page never has to keep its own copy of an episode which
 *       the publisher can change at any time.
 */
export type PodcastEpisode = {
    /**
     * Identifier given by the feed, unique within the feed and stable across its rebuilds
     */
    readonly id: string;

    /**
     * Short identifier of the episode in a link, for example `64`
     */
    readonly slug: string;

    /**
     * Number of the episode, `null` for a special which is published outside the numbering
     */
    readonly number: number | null;

    /**
     * Title as the feed publishes it, including the show name and the episode number
     */
    readonly title: string;

    /**
     * Title without the repeated show name and episode number, which is what a listing shows
     */
    readonly shortTitle: string;

    /**
     * Description of the episode with its markup and its link list removed
     */
    readonly summary: string;

    /**
     * Whole description of the episode as plain text, including what the summary cuts away
     *
     * Note: The tail of a description is where the show lists who was at the microphone, so it is kept for whoever
     *       wants to read facts out of it. It is long, so a page should not hand it to the browser unread.
     */
    readonly descriptionText: string;

    /**
     * Address of the audio file, which is what the player of the page plays
     */
    readonly audioUrl: string;

    /**
     * Page of the episode at the publisher, `null` when the feed does not name one
     */
    readonly pageUrl: string | null;

    /**
     * Moment the episode was published, as an ISO 8601 string
     */
    readonly publishedAt: string;

    /**
     * Length of the recording in seconds, `null` when the feed does not state it
     */
    readonly durationInSeconds: number | null;

    /**
     * Artwork of the episode, `null` when the episode uses the artwork of the show
     */
    readonly imageUrl: string | null;
};

/**
 * One podcast together with the episodes its feed lists, newest first
 */
export type PodcastFeed = {
    readonly title: string;
    readonly description: string;
    readonly imageUrl: string | null;
    readonly episodes: readonly PodcastEpisode[];
};

/**
 * Feed which carries no episode at all, used whenever the real feed cannot be read
 *
 * Note: A page which lists episodes has to stay readable even when the feed of the publisher is down, so it renders
 *       this instead of failing the whole request.
 */
export const EMPTY_PODCAST_FEED: PodcastFeed = {
    title: '',
    description: '',
    imageUrl: null,
    episodes: [],
};

/**
 * The episode a listener is offered first, which is the newest one the feed published
 *
 * @returns newest episode, `null` when the feed carries none
 */
export function getNewestPodcastEpisode(feed: PodcastFeed): PodcastEpisode | null {
    return feed.episodes[0] ?? null;
}
