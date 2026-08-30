import { parsePodcastRssFeed } from '@/lib/podcast/parsePodcastRssFeed';
import {
    formatPodcastEpisodeDuration,
    parsePodcastEpisodeDuration,
} from '@/lib/podcast/podcastEpisodeDuration';
import { describe, expect, it } from 'vitest';

const EXAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
    <channel>
        <title><![CDATA[AI ta Krajta]]></title>
        <description><![CDATA[Vše o AI na jednom místě.]]></description>
        <itunes:image href="https://example.com/cover.jpg"/>
        <item>
            <title><![CDATA[AI ta Krajta #12 | Agenti &amp; kontext]]></title>
            <description><![CDATA[<p>Povídáme si o agentech.</p>Děkujeme sponzorům: https://ptbk.io #ai]]></description>
            <link>https://example.com/episodes/12</link>
            <guid isPermaLink="false">episode-12</guid>
            <pubDate>Thu, 27 Aug 2026 08:25:22 GMT</pubDate>
            <enclosure url="https://example.com/12.mp3" length="1" type="audio/mpeg"/>
            <itunes:duration>00:35:34</itunes:duration>
            <itunes:episode>12</itunes:episode>
            <itunes:image href="https://example.com/12.jpg"/>
        </item>
        <item>
            <title><![CDATA[AI ta Krajta #13 | Novější díl bez čísla v tagu]]></title>
            <description><![CDATA[Novější.]]></description>
            <guid isPermaLink="false">episode-13</guid>
            <pubDate>Fri, 28 Aug 2026 08:25:22 GMT</pubDate>
            <enclosure url="https://example.com/13.mp3" length="1" type="audio/mpeg"/>
            <itunes:duration>41:02</itunes:duration>
        </item>
        <item>
            <title><![CDATA[AI ta Krajta Speciál | Bez zvuku]]></title>
            <guid isPermaLink="false">episode-without-audio</guid>
            <pubDate>Sat, 29 Aug 2026 08:25:22 GMT</pubDate>
        </item>
    </channel>
</rss>`;

describe('parsePodcastRssFeed', () => {
    const feed = parsePodcastRssFeed(EXAMPLE_FEED, {
        showTitle: 'AI ta Krajta',
        summaryStopPhrases: ['Děkujeme sponzorům'],
    });

    it('reads the show out of the channel and not out of its first episode', () => {
        expect(feed.title).toBe('AI ta Krajta');
        expect(feed.description).toBe('Vše o AI na jednom místě.');
        expect(feed.imageUrl).toBe('https://example.com/cover.jpg');
    });

    it('leaves out an episode which has nothing to play', () => {
        expect(feed.episodes.map((episode) => episode.id)).toEqual(['episode-13', 'episode-12']);
    });

    it('sorts the episodes from the newest one whatever order the feed lists them in', () => {
        expect(feed.episodes[0].number).toBe(13);
    });

    it('reads the number of an episode out of its title when the feed does not state it', () => {
        expect(feed.episodes[0].slug).toBe('13');
    });

    it('drops the repeated show name and number from the title of an episode', () => {
        expect(feed.episodes[1].shortTitle).toBe('Agenti & kontext');
        expect(feed.episodes[1].title).toBe('AI ta Krajta #12 | Agenti & kontext');
    });

    it('summarizes an episode without its markup, links and sponsor list', () => {
        expect(feed.episodes[1].summary).toBe('Povídáme si o agentech.');
    });

    it('reads what the page needs to play and to link one episode', () => {
        expect(feed.episodes[1]).toMatchObject({
            audioUrl: 'https://example.com/12.mp3',
            pageUrl: 'https://example.com/episodes/12',
            imageUrl: 'https://example.com/12.jpg',
            durationInSeconds: 35 * 60 + 34,
            publishedAt: '2026-08-27T08:25:22.000Z',
        });
    });

    it('lets a particular show read its explicit host roster before its description is shortened', () => {
        const feedWithHostNames = parsePodcastRssFeed(EXAMPLE_FEED, {
            showTitle: 'AI ta Krajta',
            readEpisodeHostNames: (descriptionHtml) =>
                descriptionHtml.includes('Povídáme si o agentech.') ? ['Pavol Hejný'] : [],
        });

        expect(feedWithHostNames.episodes.find((episode) => episode.number === 12)?.hosts).toEqual(['Pavol Hejný']);
    });

    it('reads a feed which could not be fetched as a show without episodes', () => {
        expect(parsePodcastRssFeed('').episodes).toEqual([]);
    });
});

describe('parsePodcastEpisodeDuration', () => {
    it('understands every way a feed writes a length', () => {
        expect(parsePodcastEpisodeDuration('01:05:30')).toBe(3930);
        expect(parsePodcastEpisodeDuration('41:02')).toBe(2462);
        expect(parsePodcastEpisodeDuration('90')).toBe(90);
    });

    it('refuses a length which is not one', () => {
        expect(parsePodcastEpisodeDuration('a while')).toBeNull();
        expect(parsePodcastEpisodeDuration('0')).toBeNull();
        expect(parsePodcastEpisodeDuration(null)).toBeNull();
    });
});

describe('formatPodcastEpisodeDuration', () => {
    it('writes the length the way a listener reads it', () => {
        expect(formatPodcastEpisodeDuration(3930)).toBe('1:05:30');
        expect(formatPodcastEpisodeDuration(2462)).toBe('41:02');
        expect(formatPodcastEpisodeDuration(9)).toBe('0:09');
    });
});
