import { mergePodcastEpisodes, type PartialPodcastEpisode } from '@/lib/podcast/mergePodcastEpisodes';
import { describe, expect, it } from 'vitest';

const SHOW_CONVENTIONS = { showTitle: 'AI ta Krajta', summaryStopPhrases: ['Děkujeme sponzorům'] };

/**
 * What the podcast feed of the show says, which is the recording and everything written about it
 */
const FEED_EPISODES: readonly PartialPodcastEpisode[] = [
    {
        id: 'guid-12',
        slug: '12',
        number: 12,
        title: 'AI ta Krajta #12 | Agenti & kontext',
        shortTitle: 'Agenti & kontext',
        summary: 'Povídáme si o agentech.',
        descriptionText: 'Povídáme si o agentech. Děkujeme sponzorům.',
        hosts: ['Pavol Hejný', 'Jiří Jahn'],
        audioUrl: 'https://example.com/12.mp3',
        pageUrl: 'https://podcasters.example.com/12',
        publishedAt: '2026-08-27T08:25:22.000Z',
        durationInSeconds: 2134,
    },
];

/**
 * What the video channel of the show says, which is the video and an episode which is only out as one
 */
const YOUTUBE_EPISODES: readonly PartialPodcastEpisode[] = [
    {
        id: 'youtube:aaaaaaaaaaa',
        number: 13,
        title: 'AI ta Krajta #13 | Zatím jenom video',
        descriptionText: 'Zatím jenom video. Děkujeme sponzorům.',
        videoUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
        publishedAt: '2026-08-28T08:00:00.000Z',
    },
    {
        id: 'youtube:bbbbbbbbbbb',
        number: 12,
        title: 'AI ta Krajta #12 | Agenti a kontext',
        hosts: ['Jiri Jahn', 'Petr Glaser'],
        videoUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb',
        publishedAt: '2026-08-27T06:00:00.000Z',
    },
];

/**
 * What the application has written down, which is the whole archive without asking anybody
 */
const INTERNAL_EPISODES: readonly PartialPodcastEpisode[] = [
    {
        id: 'internal:12',
        number: 12,
        title: 'AI ta Krajta #12 | Agenti & kontext',
        videoUrl: 'https://www.youtube.com/watch?v=ccccccccccc',
        publishedAt: '2026-08-27T08:25:22.000Z',
        durationInSeconds: 2134,
    },
    {
        id: 'internal:11',
        number: 11,
        title: 'AI ta Krajta #11 | Jen v seznamu',
        videoUrl: 'https://www.youtube.com/watch?v=ddddddddddd',
        publishedAt: '2026-08-20T08:00:00.000Z',
        durationInSeconds: 1800,
    },
];

describe('mergePodcastEpisodes', () => {
    const episodes = mergePodcastEpisodes(
        [FEED_EPISODES, YOUTUBE_EPISODES, INTERNAL_EPISODES],
        SHOW_CONVENTIONS,
    );

    it('lists every episode any source knows exactly once, newest first', () => {
        expect(episodes.map((episode) => episode.slug)).toEqual(['13', '12', '11']);
    });

    it('gives one episode the recording of one source and the video of another', () => {
        expect(episodes[1]).toMatchObject({
            audioUrl: 'https://example.com/12.mp3',
            videoUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb',
            pageUrl: 'https://podcasters.example.com/12',
        });
    });

    it('lets no later source overwrite what an earlier one said', () => {
        expect(episodes[1]).toMatchObject({
            id: 'guid-12',
            title: 'AI ta Krajta #12 | Agenti & kontext',
            summary: 'Povídáme si o agentech.',
        });
    });

    it('joins host names from every source without repeating a name spelled without diacritics', () => {
        expect(episodes[1].hosts).toEqual(['Pavol Hejný', 'Jiří Jahn', 'Petr Glaser']);
    });

    it('keeps an episode which is only published as a video, with nothing to play', () => {
        expect(episodes[0]).toMatchObject({
            slug: '13',
            shortTitle: 'Zatím jenom video',
            audioUrl: null,
            videoUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
        });
    });

    it('summarizes an episode which no source summarized out of its description', () => {
        expect(episodes[0].summary).toBe('Zatím jenom video.');
    });

    it('keeps an episode which only the written down list knows', () => {
        expect(episodes[2]).toMatchObject({
            slug: '11',
            number: 11,
            shortTitle: 'Jen v seznamu',
            durationInSeconds: 1800,
        });
    });

    it('recognizes the same special across sources by the title both of them publish it under', () => {
        const specialTitle = 'AI ta Krajta Speciál | O dezinformacích';
        const mergedSpecials = mergePodcastEpisodes(
            [
                [{ title: specialTitle, audioUrl: 'https://example.com/special.mp3' }],
                [{ title: specialTitle, videoUrl: 'https://www.youtube.com/watch?v=eeeeeeeeeee' }],
            ],
            SHOW_CONVENTIONS,
        );

        expect(mergedSpecials).toHaveLength(1);
        expect(mergedSpecials[0]).toMatchObject({
            number: null,
            audioUrl: 'https://example.com/special.mp3',
            videoUrl: 'https://www.youtube.com/watch?v=eeeeeeeeeee',
        });
    });

    it('reads no source at all as an archive without episodes', () => {
        expect(mergePodcastEpisodes([[], [], []])).toEqual([]);
    });
});
