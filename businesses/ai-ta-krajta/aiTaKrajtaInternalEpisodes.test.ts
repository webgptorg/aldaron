import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { getAiTaKrajtaEpisodeLink } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeLink';
import {
    AI_TA_KRAJTA_INTERNAL_EPISODES,
    createAiTaKrajtaInternalEpisodes,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { AI_TA_KRAJTA_NAME } from '@/businesses/ai-ta-krajta/config';
import { mergePodcastEpisodes } from '@/lib/podcast/mergePodcastEpisodes';
import { extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import { describe, expect, it } from 'vitest';

/**
 * Builds an episode of the page out of what one test is about, so that a test says only what it checks
 */
function createPageEpisode(values: Partial<AiTaKrajtaEpisode>): AiTaKrajtaEpisode {
    return {
        id: 'episode',
        slug: '1',
        number: 1,
        title: 'AI ta Krajta #1',
        shortTitle: 'Testovací díl',
        summary: '',
        audioUrl: 'https://example.com/1.mp3',
        videoUrl: null,
        pageUrl: null,
        publishedAt: '2026-08-01T00:00:00.000Z',
        durationInSeconds: 1800,
        imageUrl: null,
        hosts: [],
        personIds: [],
        ...values,
    };
}

describe('AI_TA_KRAJTA_INTERNAL_EPISODES', () => {
    it('carries the whole archive of the show', () => {
        expect(AI_TA_KRAJTA_INTERNAL_EPISODES.length).toBeGreaterThan(60);
    });

    it('names each episode once, so no episode can be listed twice', () => {
        const episodeKeys = AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => episode.number ?? episode.title);

        expect(new Set(episodeKeys).size).toBe(episodeKeys.length);
    });

    it('links every video by an address YouTube really serves', () => {
        const brokenVideoIds = AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => episode.youtubeVideoId).filter(
            (youtubeVideoId) => youtubeVideoId !== null && extractYoutubeVideoId(youtubeVideoId) === null,
        );

        expect(brokenVideoIds).toEqual([]);
    });

    it('says when every episode was published', () => {
        const brokenMoments = AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => episode.publishedAt).filter(
            (publishedAt) => Number.isNaN(new Date(publishedAt).getTime()),
        );

        expect(brokenMoments).toEqual([]);
    });

    it('keeps the verified roster of an episode whose live description omits it', () => {
        const episode = AI_TA_KRAJTA_INTERNAL_EPISODES.find((candidate) => candidate.number === 62);

        expect(episode?.hosts).toEqual(['Pavol Hejný', 'Jiří Jahn', 'Katka Fajmanová']);
    });

    it('writes each roster as a list of non-empty names', () => {
        const emptyHostNames = AI_TA_KRAJTA_INTERNAL_EPISODES.flatMap((episode) =>
            episode.hosts.filter((hostName) => hostName.trim() === ''),
        );

        expect(emptyHostNames).toEqual([]);
    });
});

describe('createAiTaKrajtaInternalEpisodes', () => {
    // Note: This is the archive as the page renders it while neither the podcast feed nor YouTube can be read, which
    //       is the whole reason the list is written down at all.
    const episodes = mergePodcastEpisodes([createAiTaKrajtaInternalEpisodes()], { showTitle: AI_TA_KRAJTA_NAME });

    it('lists the whole archive on its own, newest first', () => {
        expect(episodes.length).toBe(AI_TA_KRAJTA_INTERNAL_EPISODES.length);
        expect(episodes[0].publishedAt >= episodes[1].publishedAt).toBe(true);
    });

    it('gives every episode a link to watch and nothing to play', () => {
        const episodesWithoutVideo = episodes.filter((episode) => episode.videoUrl === null);

        expect(episodes.every((episode) => episode.audioUrl === null)).toBe(true);
        expect(episodesWithoutVideo.length).toBeLessThanOrEqual(1);
    });

    it('drops the repeated show name and number from the title of an episode', () => {
        expect(episodes.every((episode) => !episode.shortTitle.startsWith(AI_TA_KRAJTA_NAME))).toBe(true);
    });
});

describe('getAiTaKrajtaEpisodeLink', () => {
    it('opens an episode on YouTube whenever there is a video of it', () => {
        const episode = createPageEpisode({
            videoUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
            pageUrl: 'https://podcasters.example.com/1',
        });

        expect(getAiTaKrajtaEpisodeLink(episode)).toEqual({
            label: 'Otevřít na YouTube',
            url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
        });
    });

    it('falls back to the page of the publisher for an episode which has no video', () => {
        const episode = createPageEpisode({ pageUrl: 'https://podcasters.example.com/1' });

        expect(getAiTaKrajtaEpisodeLink(episode)).toEqual({
            label: 'Otevřít u vydavatele',
            url: 'https://podcasters.example.com/1',
        });
    });

    it('offers nothing rather than a dead link for an episode nobody links', () => {
        expect(getAiTaKrajtaEpisodeLink(createPageEpisode({}))).toBeNull();
    });
});
