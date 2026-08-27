import {
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_EPISODES,
    AI_TA_KRAJTA_KIND,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_SOCIAL_URLS,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
    createAiTaKrajtaSpotifyEpisodeUrl,
} from '@/businesses/ai-ta-krajta/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import {
    createPodcastSeriesStructuredData,
    createWebPageStructuredData,
    type StructuredDataNode,
} from '@/lib/metadata/structured-data';
import type { Metadata } from 'next';

/**
 * All metadata stems from this definition, including the canonical URL, sharing tags and sitemap entry.
 */
export const AI_TA_KRAJTA_PAGE_DEFINITION: PageMetadataDefinition = {
    path: AI_TA_KRAJTA_PATH,
    language: 'cs',
    title: 'AI ta Krajta | Český podcast o umělé inteligenci',
    socialTitle: AI_TA_KRAJTA_NAME,
    description:
        'AI ta Krajta je český video podcast o umělé inteligenci. Každý týden novinky, debata a lidé, kteří AI opravdu používají.',
    socialDescription: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs,
    socialPreviewImageAlt: 'AI ta Krajta, český video podcast o umělé inteligenci',
    keywords: [
        'AI ta Krajta',
        'AI podcast',
        'český podcast o AI',
        'umělá inteligence',
        'video podcast',
        'AI novinky',
        'Spotify podcast',
    ],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'weekly',
};

export const AI_TA_KRAJTA_METADATA: Metadata = createPageMetadata(AI_TA_KRAJTA_PAGE_DEFINITION);

export const AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS: SocialPreviewImageOptions = createSocialPreviewOptions(
    AI_TA_KRAJTA_PAGE_DEFINITION,
    {
        brandLabel: AI_TA_KRAJTA_NAME,
        eyebrow: AI_TA_KRAJTA_KIND,
        audienceLabel: 'Pro lidi, které AI baví i trochu děsí',
        bullets: ['Každý týden', 'Česky', 'Video i audio'],
        stats: [
            { label: 'Kde', value: 'YouTube, Spotify, Apple Podcasts' },
            { label: 'Díly', value: 'Novinky, názory, hosté' },
            { label: 'Tempo', value: 'Jednou týdně' },
        ],
        callToActionLabel: 'Pustit si díl',
        paletteSeed: {
            backgroundStart: AI_TA_KRAJTA_COLORS.DARKER,
            backgroundEnd: AI_TA_KRAJTA_COLORS.DARK,
            accent: AI_TA_KRAJTA_COLORS.CORAL,
            accentSoft: AI_TA_KRAJTA_COLORS.VIOLET,
        },
    },
);

/**
 * Schema.org nodes for the page and its podcast. The highlighted episodes get their canonical Spotify URLs so search
 * engines can associate the on-page player with a real, listenable episode.
 */
export function createAiTaKrajtaStructuredData(): readonly StructuredDataNode[] {
    const podcastStructuredData = createPodcastSeriesStructuredData({
        name: AI_TA_KRAJTA_NAME,
        description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
        path: AI_TA_KRAJTA_PATH,
        imagePath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
        language: 'cs',
        author: { name: AI_TA_KRAJTA_NAME, type: 'Organization' },
        channelUrls: AI_TA_KRAJTA_SOCIAL_URLS,
    });

    return [
        createWebPageStructuredData(AI_TA_KRAJTA_PAGE_DEFINITION),
        {
            ...podcastStructuredData,
            episode: AI_TA_KRAJTA_EPISODES.map((episode) => ({
                '@type': 'PodcastEpisode',
                name: `AI ta Krajta #${episode.number} | ${episode.title}`,
                url: createAiTaKrajtaSpotifyEpisodeUrl(episode.spotifyEpisodeId),
            })),
        },
    ];
}
