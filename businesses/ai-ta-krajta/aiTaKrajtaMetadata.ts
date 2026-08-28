import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { createAiTaKrajtaEpisodePath } from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import {
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_SOCIAL_URLS,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
} from '@/businesses/ai-ta-krajta/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import {
    createPodcastSeriesStructuredData,
    createWebPageStructuredData,
    type StructuredDataNode,
} from '@/lib/metadata/structured-data';
import type { Metadata } from 'next';

/**
 * How many newest episodes the structured data lists, which is enough for a search engine to understand the show
 * without repeating the whole archive in every response
 */
const STRUCTURED_DATA_EPISODE_COUNT = 10;

/**
 * The definition every piece of metadata of this page stems from, including the canonical url, the sharing tags and
 * the entry in the sitemap
 */
export const AI_TA_KRAJTA_PAGE_DEFINITION: PageMetadataDefinition = {
    path: AI_TA_KRAJTA_PATH,
    language: 'cs',
    title: 'AI ta Krajta | Český podcast o umělé inteligenci',
    socialTitle: AI_TA_KRAJTA_NAME,
    description:
        'Každý týden si sedneme a probereme, co se v AI stalo. Poslechněte si díly přímo tady, nebo se na ně podívejte na YouTube.',
    socialDescription: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs,
    socialPreviewImageAlt: 'AI ta Krajta, český podcast o umělé inteligenci',
    keywords: [
        'AI ta Krajta',
        'AI podcast',
        'český podcast o AI',
        'umělá inteligence',
        'AI novinky',
        'podcast o technologiích',
        'Pavol Hejný',
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
        eyebrow: 'Podcast',
        audienceLabel: 'Pro lidi, kteří AI staví i používají',
        bullets: ['Česky', 'Video i audio', 'Bez PR balastu'],
        stats: [
            { label: 'Kde', value: 'YouTube, Spotify, Apple Podcasts' },
            { label: 'Nový díl', value: 'Každý týden' },
            { label: 'Délka', value: '40 až 50 minut' },
        ],
        callToActionLabel: 'Pustit poslední díl',
        paletteSeed: {
            backgroundStart: AI_TA_KRAJTA_COLORS.MOSS_DEEP,
            backgroundEnd: AI_TA_KRAJTA_COLORS.MOSS,
            accent: AI_TA_KRAJTA_COLORS.CORAL,
            accentSoft: AI_TA_KRAJTA_COLORS.INDIGO,
        },
    },
);

/**
 * Schema.org nodes of the page and of the show
 *
 * Note: The episodes come from the same feed the page renders, so a search engine never learns about an episode which
 *       the page cannot play.
 *
 * @param episodes archive of the show, newest first
 */
export function createAiTaKrajtaStructuredData(episodes: readonly AiTaKrajtaEpisode[]): readonly StructuredDataNode[] {
    return [
        createWebPageStructuredData(AI_TA_KRAJTA_PAGE_DEFINITION),
        createPodcastSeriesStructuredData({
            name: AI_TA_KRAJTA_NAME,
            description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
            path: AI_TA_KRAJTA_PATH,
            imagePath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
            language: 'cs',
            author: { name: AI_TA_KRAJTA_NAME, type: 'Organization' },
            channelUrls: AI_TA_KRAJTA_SOCIAL_URLS,
            episodes: episodes.slice(0, STRUCTURED_DATA_EPISODE_COUNT).map((episode) => ({
                name: episode.title,
                url: createAbsoluteUrl(createAiTaKrajtaEpisodePath(episode.slug)),
                audioUrl: episode.audioUrl,
                publishedAt: episode.publishedAt,
                episodeNumber: episode.number,
                durationInSeconds: episode.durationInSeconds,
            })),
        }),
    ];
}
