import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { createAiTaKrajtaAudienceStatistics } from '@/businesses/ai-ta-krajta/aiTaKrajtaAudienceStatistics';
import type { AiTaKrajtaPublicPlatformStatistics } from '@/businesses/ai-ta-krajta/aiTaKrajtaPublicPlatformStatistics';
import { formatAiTaKrajtaEstimate } from '@/businesses/ai-ta-krajta/aiTaKrajtaFormatting';
import { describe, expect, it } from 'vitest';

const PLATFORM_STATISTICS: AiTaKrajtaPublicPlatformStatistics = {
    youtubeSubscriberCount: 1_840,
    youtubeViewCount: 100_000,
    youtubeVideoCount: 10,
    linkedInFollowerCount: 894,
    instagramFollowerCount: 17,
    applePodcastReviewCount: 3,
    isSpotifyShowAvailable: true,
    isApplePodcastsShowAvailable: true,
};

function createEpisode(id: string, durationInSeconds: number | null): AiTaKrajtaEpisode {
    return {
        id,
        slug: id,
        number: null,
        title: `AI ta Krajta ${id}`,
        shortTitle: id,
        summary: '',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
        pageUrl: null,
        publishedAt: '2026-08-30T12:00:00.000Z',
        durationInSeconds,
        imageUrl: null,
        personIds: [],
    };
}

describe('createAiTaKrajtaAudienceStatistics', () => {
    it('combines public subscriptions with the duration and distribution of the merged episode archive', () => {
        const statistics = createAiTaKrajtaAudienceStatistics(
            [createEpisode('1', 3_600), createEpisode('2', 3_600)],
            PLATFORM_STATISTICS,
        );

        expect(statistics).toEqual({
            estimatedSubscriberCount: 2_754,
            estimatedListeningHours: 9_100,
        });
    });

    it('does not replace unreadable public metrics with zeros', () => {
        const statistics = createAiTaKrajtaAudienceStatistics([createEpisode('1', 3_600)], {
            ...PLATFORM_STATISTICS,
            youtubeSubscriberCount: null,
            youtubeViewCount: null,
            youtubeVideoCount: null,
            linkedInFollowerCount: null,
            instagramFollowerCount: null,
            applePodcastReviewCount: null,
        });

        expect(statistics).toEqual({
            estimatedSubscriberCount: null,
            estimatedListeningHours: null,
        });
    });
});

describe('formatAiTaKrajtaEstimate', () => {
    it('deliberately rounds public estimates down to a broad, readable range', () => {
        expect(formatAiTaKrajtaEstimate(2_754)).toBe('2 500+');
        expect(formatAiTaKrajtaEstimate(22_426)).toBe('20 000+');
    });
});
