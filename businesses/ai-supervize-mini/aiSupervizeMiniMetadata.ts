import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const AI_SUPERVIZE_MINI_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/ai-supervize-mini',
    language: 'cs',
    title: 'AI Supervize Mini | Celodenní workshop pro jednotlivce',
    socialTitle: 'AI Supervize Mini - celodenní workshop',
    description:
        'Hands-on workshop pro vývojáře a produkťáky v TypeScriptu nebo JavaScriptu: nástroje, rizika, verzování, testování a code quality v AI vývoji, prezenčně v Praze i online.',
    socialDescription:
        'Jednodenní workshop, jak komplexně přemýšlet nad AI vývojem od zadání po merge. Praha i online, max 10 účastníků.',
    socialPreviewImageAlt: 'AI Supervize Mini - celodenní workshop pro vývojáře a produkťáky',
    keywords: ['AI workshop', 'školení AI', 'vývojáři', 'TypeScript', 'JavaScript', 'Praha', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.8,
    sitemapChangeFrequency: 'weekly',
};

export const AI_SUPERVIZE_MINI_METADATA: Metadata = createPageMetadata(AI_SUPERVIZE_MINI_PAGE_DEFINITION);

export const AI_SUPERVIZE_MINI_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(AI_SUPERVIZE_MINI_PAGE_DEFINITION, {
    eyebrow: 'Jednodenní workshop',
    audienceLabel: 'Pro vývojáře a produkťáky',
    bullets: ['Praha i online', 'Max 10 účastníků', 'TypeScript / JavaScript'],
    stats: [
        { label: 'Formát', value: 'Celý den hands-on' },
        { label: 'Obsah', value: 'Od zadání po merge' },
        { label: 'Kapacita', value: 'Max 10 lidí' },
    ],
    callToActionLabel: 'Rezervovat místo',
    paletteSeed: {
        backgroundStart: '#0a0a1f',
        backgroundEnd: '#2a1f4d',
        accent: '#b48fff',
        accentSoft: '#7aebff',
    },
});

/**
 * Definition of the practical information for people who already registered, which has no place in search results
 */
const AI_SUPERVIZE_MINI_PARTICIPANT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/ai-supervize-mini/participant',
    language: 'cs',
    title: 'Informace pro účastníka | AI Supervize Mini',
    description:
        'Praktické informace, harmonogram a příprava pro registrované účastníky jednodenního workshopu AI Supervize Mini.',
    isIndexed: false,
};

export const AI_SUPERVIZE_MINI_PARTICIPANT_METADATA: Metadata = createPageMetadata(
    AI_SUPERVIZE_MINI_PARTICIPANT_PAGE_DEFINITION,
);
