/**
 * @vitest-environment jsdom
 */

import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { AiTaKrajtaEpisodeCard } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeCard';
import { AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL } from '@/businesses/ai-ta-krajta/config';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const EPISODE: AiTaKrajtaEpisode = {
    id: 'episode-64',
    slug: '64',
    number: 64,
    title: 'AI ta Krajta #64 | Tři AI lidé opouštějí Google',
    shortTitle: 'Tři AI lidé opouštějí Google',
    summary: 'Novinky z AI.',
    audioUrl: 'https://example.com/episode-64.mp3',
    pageUrl: 'https://podcasters.spotify.com/pod/show/aitakrajta/episodes/episode-64',
    publishedAt: '2026-08-28T08:25:22.000Z',
    durationInSeconds: 35 * 60 + 34,
    imageUrl: null,
    personIds: [],
};

afterEach(cleanup);

describe('AI ta Krajta episode card', () => {
    it('opens the podcast publisher on YouTube instead of the RSS item page', () => {
        render(
            <AiTaKrajtaEpisodeCard
                episode={EPISODE}
                isLoaded={false}
                isPlaying={false}
                selectedPersonId={null}
                onPlayToggle={() => undefined}
                onPersonClick={() => undefined}
            />,
        );

        expect(screen.getByRole('link', { name: /Otevřít u vydavatele/ }).getAttribute('href')).toBe(
            AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
        );
    });
});
