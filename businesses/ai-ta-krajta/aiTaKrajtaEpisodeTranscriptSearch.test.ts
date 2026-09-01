import {
    findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeTranscriptSearch';
import type { AiTaKrajtaInternalEpisode } from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { describe, expect, it } from 'vitest';

function createInternalEpisode(values: Partial<AiTaKrajtaInternalEpisode>): AiTaKrajtaInternalEpisode {
    return {
        number: 7,
        title: 'AI ta Krajta #7 | Testovací díl',
        publishedAt: '2026-08-01T00:00:00.000Z',
        durationInSeconds: 1800,
        youtubeVideoId: 'aaaaaaaaaaa',
        hosts: [],
        transcript: '',
        ...values,
    };
}

describe('findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes', () => {
    it('finds every word in a complete transcript without regard to Czech diacritics', () => {
        const episodeSlugs = findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes(
            [
                createInternalEpisode({ transcript: 'Mluvíme o křemíkových čipech a lokálních modelech.' }),
                createInternalEpisode({ number: 8, transcript: 'Mluvíme o vzdáleném nasazení.' }),
            ],
            'kremikovych modelech',
        );

        expect(episodeSlugs).toEqual(['7']);
    });

    it('does not turn an empty query into every transcript match', () => {
        expect(
            findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes([createInternalEpisode({ transcript: 'AI' })], ''),
        ).toEqual([]);
    });
});
