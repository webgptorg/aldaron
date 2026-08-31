import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const CITIES_CS_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/pro-mesta',
    language: 'cs',
    title: 'AI odborník, který mluví jazykem Vaší obce | Promptbook',
    socialTitle: 'AI odborník, který mluví jazykem Vaší obce',
    description:
        'Promptbook pomáhá samosprávám proměnit interní pravidla, znalosti a procesy ve spolehlivého AI odborníka pro úřad. Open-source, s daty pod Vaší kontrolou.',
    socialDescription:
        'Promptbook pomáhá samosprávám proměnit interní pravidla, znalosti a procesy ve spolehlivého AI odborníka pro úřad.',
    socialPreviewImageAlt: 'Promptbook pro města a obce - AI odborník, který mluví jazykem Vaší obce',
    keywords: ['AI pro města', 'AI pro obce', 'samospráva', 'úřad', 'digitalizace veřejné správy', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.9,
};

export const CITIES_CS_METADATA: Metadata = createPageMetadata(CITIES_CS_PAGE_DEFINITION);

export const CITIES_CS_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(CITIES_CS_PAGE_DEFINITION, {
    eyebrow: 'AI transformace pro města a obce',
    artwork: 'city',
    paletteSeed: {
        backgroundStart: '#06111d',
        backgroundEnd: '#183752',
        accent: '#7aebff',
        accentSoft: '#8fffcc',
    },
});
