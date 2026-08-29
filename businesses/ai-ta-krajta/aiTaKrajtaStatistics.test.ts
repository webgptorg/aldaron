import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import {
    calculateAiTaKrajtaEstimatedAudienceCount,
    calculateAiTaKrajtaEstimatedListeningHours,
    createAiTaKrajtaStatistics,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaStatistics';
import { describe, expect, it } from 'vitest';

function createEpisode(values: Partial<AiTaKrajtaEpisode> = {}): AiTaKrajtaEpisode {
    return {
        id: 'episode',
        slug: '1',
        number: 1,
        title: 'AI ta Krajta #1',
        shortTitle: 'Testovací díl',
        summary: '',
        audioUrl: 'https://example.com/1.mp3',
        pageUrl: null,
        publishedAt: '2026-08-01T00:00:00.000Z',
        durationInSeconds: 30 * 60,
        imageUrl: null,
        personIds: [],
        ...values,
    };
}

describe('AI ta Krajta statistics', () => {
    it('includes the documented estimates from every listening platform', () => {
        expect(calculateAiTaKrajtaEstimatedAudienceCount()).toBe(4_500);
    });

    it('turns known RSS durations into a rounded all-platform listening-time estimate', () => {
        const episodes = [
            createEpisode({ id: 'first', durationInSeconds: 25 * 60 * 60 }),
            createEpisode({ id: 'second', durationInSeconds: 25 * 60 * 60 }),
            createEpisode({ id: 'without-duration', durationInSeconds: null }),
        ];

        expect(calculateAiTaKrajtaEstimatedListeningHours(episodes)).toBe(10_000);
        expect(createAiTaKrajtaStatistics(episodes)).toEqual({
            estimatedAudienceCount: 4_500,
            estimatedListeningHours: 10_000,
        });
    });

    it('does not claim listening time when the feed gives no usable duration', () => {
        expect(calculateAiTaKrajtaEstimatedListeningHours([createEpisode({ durationInSeconds: null })])).toBeNull();
    });
});
