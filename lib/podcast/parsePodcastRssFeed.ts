import { parsePodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { EMPTY_PODCAST_FEED, type PodcastEpisode, type PodcastFeed } from '@/lib/podcast/PodcastFeed';
import {
    convertHtmlDescriptionToPlainText,
    readRssChannelHeader,
    readRssItems,
    readXmlTagAttribute,
    readXmlTagText,
} from '@/lib/podcast/rssXml';

export type ParsePodcastRssFeedOptions = {
    /**
     * Name of the show as it repeats at the beginning of every episode title, so that a listing can drop it
     */
    readonly showTitle?: string;

    /**
     * Phrases after which a description stops summarizing the episode and starts listing links, sponsors or chapters
     *
     * Note: Which phrases those are is a habit of the editors of one show, so the show says them and the parser only
     *       applies them.
     */
    readonly summaryStopPhrases?: readonly string[];
};

/**
 * Reads the number of an episode, which a feed either writes into the title as `#64` or states in its own tag
 *
 * Note: The title wins, because it is the number the listeners see and quote. The tag is a second place where the
 *       editors type the same number, and this very feed has already shipped two different episodes stating `62`.
 */
function readEpisodeNumber(itemXml: string, title: string): number | null {
    const titleNumberMatch = /#\s*(\d+)/.exec(title);

    if (titleNumberMatch !== null) {
        return Number(titleNumberMatch[1]);
    }

    const statedNumber = Number(readXmlTagText(itemXml, 'itunes:episode'));

    return Number.isSafeInteger(statedNumber) && statedNumber > 0 ? statedNumber : null;
}

/**
 * Escapes the text so that a regular expression built around it matches exactly that text
 */
function escapeRegularExpression(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turns a title into the part which actually says what the episode is about
 *
 * @param title full title, for example `AI ta Krajta #64 | Ctyri AI lidri opousteji Google`
 * @param showTitle name of the show which every title repeats
 */
function readShortTitle(title: string, showTitle: string | undefined): string {
    const titleAfterSeparator = title.includes('|') ? title.slice(title.indexOf('|') + 1) : title;
    const titleWithoutShowTitle =
        showTitle === undefined
            ? titleAfterSeparator
            : titleAfterSeparator.replace(new RegExp(`^\\s*${escapeRegularExpression(showTitle)}\\s*`, 'i'), '');

    return titleWithoutShowTitle.replace(/^[\s#\d|:.-]+/, '').trim() || title;
}

/**
 * Reads the whole description of an episode as plain text
 */
function readDescriptionText(itemXml: string): string {
    const description = readXmlTagText(itemXml, 'description') ?? readXmlTagText(itemXml, 'itunes:summary') ?? '';

    return convertHtmlDescriptionToPlainText(description);
}

/**
 * Cuts a description at the point where it stops summarizing and starts listing links, sponsors or chapters
 */
function readSummary(descriptionText: string, summaryStopPhrases: readonly string[]): string {
    const stopIndex = summaryStopPhrases.reduce((earliestStopIndex, stopPhrase) => {
        const phraseIndex = descriptionText.indexOf(stopPhrase);

        return phraseIndex === -1 ? earliestStopIndex : Math.min(earliestStopIndex, phraseIndex);
    }, descriptionText.length);

    return descriptionText.slice(0, stopIndex).trim();
}

/**
 * Turns a title into the part of a link which says which episode it leads to
 */
function createTitleSlug(title: string): string {
    return title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 44)
        .replace(/^-+|-+$/g, '');
}

/**
 * Reads the moment an episode was published, falling back to the beginning of time so that sorting never throws
 */
function readPublishedAt(itemXml: string): string {
    const publishedAt = new Date(readXmlTagText(itemXml, 'pubDate') ?? '');

    return Number.isNaN(publishedAt.getTime()) ? new Date(0).toISOString() : publishedAt.toISOString();
}

/**
 * Reads one `<item>` of a feed as one episode, `null` when it has nothing to play
 */
function parsePodcastEpisode(itemXml: string, options: ParsePodcastRssFeedOptions): PodcastEpisode | null {
    const audioUrl = readXmlTagAttribute(itemXml, 'enclosure', 'url');
    const title = readXmlTagText(itemXml, 'title');

    if (audioUrl === null || title === null) {
        return null;
    }

    const number = readEpisodeNumber(itemXml, title);
    const descriptionText = readDescriptionText(itemXml);

    return {
        id: readXmlTagText(itemXml, 'guid') ?? audioUrl,
        slug: number === null ? createTitleSlug(title) : String(number),
        number,
        title,
        shortTitle: readShortTitle(title, options.showTitle),
        summary: readSummary(descriptionText, options.summaryStopPhrases ?? []),
        descriptionText,
        audioUrl,
        pageUrl: readXmlTagText(itemXml, 'link'),
        publishedAt: readPublishedAt(itemXml),
        durationInSeconds: parsePodcastEpisodeDuration(readXmlTagText(itemXml, 'itunes:duration')),
        imageUrl: readXmlTagAttribute(itemXml, 'itunes:image', 'href'),
    };
}

/**
 * Makes sure that a link which names one episode can never mean two of them
 *
 * Note: Two episodes end up sharing a slug whenever the editors mistype a number, which they do. The older of the two
 *       keeps the number and its title takes over, so that the newest episode always has the short link.
 */
function withUniqueSlugs(episodes: readonly PodcastEpisode[]): readonly PodcastEpisode[] {
    const takenSlugs = new Set<string>();

    return episodes.map((episode) => {
        if (!takenSlugs.has(episode.slug)) {
            takenSlugs.add(episode.slug);
            return episode;
        }

        return { ...episode, slug: createTitleSlug(episode.title) };
    });
}

/**
 * Reads a podcast and its episodes out of the RSS feed the publisher of the podcast serves
 *
 * Note: The feed is the single source of truth about the episodes, so nothing here invents a value which the feed
 *       does not state. An episode which has no audio is left out, because the page could not play it anyway.
 *
 * @param xml body of the RSS feed
 * @param options habits of the one show, such as how its titles and descriptions are written
 * @returns the show with its episodes sorted from the newest one
 */
export function parsePodcastRssFeed(xml: string, options: ParsePodcastRssFeedOptions = {}): PodcastFeed {
    const channelHeader = readRssChannelHeader(xml);
    const episodes = withUniqueSlugs(
        readRssItems(xml)
            .map((itemXml) => parsePodcastEpisode(itemXml, options))
            .filter((episode): episode is PodcastEpisode => episode !== null)
            .sort((firstEpisode, secondEpisode) => secondEpisode.publishedAt.localeCompare(firstEpisode.publishedAt)),
    );

    return {
        ...EMPTY_PODCAST_FEED,
        title: readXmlTagText(channelHeader, 'title') ?? EMPTY_PODCAST_FEED.title,
        description: readXmlTagText(channelHeader, 'description') ?? EMPTY_PODCAST_FEED.description,
        imageUrl: readXmlTagAttribute(channelHeader, 'itunes:image', 'href'),
        episodes,
    };
}
