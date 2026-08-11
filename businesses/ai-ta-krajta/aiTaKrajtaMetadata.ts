import {
    AI_TA_KRAJTA_ACCENT_COLOR,
    AI_TA_KRAJTA_ACCENT_SOFT_COLOR,
    AI_TA_KRAJTA_BACKGROUND_COLOR,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_KIND,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
} from '@/businesses/ai-ta-krajta/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createPodcastSeriesStructuredData, type StructuredDataNode } from '@/lib/metadata/structured-data';
import type { Metadata } from 'next';

/**
 * Person the podcast is hosted by
 */
const AI_TA_KRAJTA_HOST_NAME = 'Pavol Hejný';

export const AI_TA_KRAJTA_PAGE_DEFINITION: PageMetadataDefinition = {
    path: AI_TA_KRAJTA_PATH,
    language: 'cs',
    title: `${AI_TA_KRAJTA_NAME} | Český video podcast o umělé inteligenci`,
    socialTitle: AI_TA_KRAJTA_NAME,
    description: `${AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs} Nový díl každý týden, zdarma na YouTube.`,
    socialDescription: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs,
    socialPreviewImageAlt: `${AI_TA_KRAJTA_NAME} - český video podcast o umělé inteligenci`,
    keywords: [
        AI_TA_KRAJTA_NAME,
        'AI podcast',
        'český podcast o AI',
        'umělá inteligence',
        'video podcast',
        'novinky z AI',
        'Pavol Hejný',
    ],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'weekly',
};

export const AI_TA_KRAJTA_METADATA: Metadata = createPageMetadata(AI_TA_KRAJTA_PAGE_DEFINITION);

export const AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(AI_TA_KRAJTA_PAGE_DEFINITION, {
    brandLabel: AI_TA_KRAJTA_NAME,
    eyebrow: `${AI_TA_KRAJTA_KIND} o umělé inteligenci`,
    audienceLabel: 'Pro každého, koho AI zajímá',
    bullets: ['Nový díl každý týden', 'Česky', 'Zdarma na YouTube'],
    stats: [
        { label: 'Formát', value: AI_TA_KRAJTA_KIND },
        { label: 'Obsah', value: 'Novinky, zajímavosti, diskuze' },
        { label: 'Kde', value: 'YouTube' },
    ],
    callToActionLabel: 'Sledovat na YouTube',
    paletteSeed: {
        backgroundStart: '#161c19',
        backgroundEnd: AI_TA_KRAJTA_BACKGROUND_COLOR,
        accent: AI_TA_KRAJTA_ACCENT_COLOR,
        accentSoft: AI_TA_KRAJTA_ACCENT_SOFT_COLOR,
    },
});

/**
 * Builds the schema.org description of the show behind the page
 */
export function createAiTaKrajtaStructuredData(): StructuredDataNode {
    return createPodcastSeriesStructuredData({
        name: AI_TA_KRAJTA_NAME,
        description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
        path: AI_TA_KRAJTA_PAGE_DEFINITION.path,
        imagePath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
        language: AI_TA_KRAJTA_PAGE_DEFINITION.language,
        authorName: AI_TA_KRAJTA_HOST_NAME,
        channelUrls: [AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL],
    });
}
