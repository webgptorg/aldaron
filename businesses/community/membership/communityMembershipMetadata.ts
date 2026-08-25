import { COMMUNITY_MEMBERSHIP_PATH } from '@/businesses/community/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const COMMUNITY_MEMBERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_MEMBERSHIP_PATH,
    language: 'cs',
    title: 'Premium členství komunity | Promptbook',
    socialTitle: 'Premium členství komunity Promptbooku',
    description:
        'Exkluzivní obsah, praktické workshopy a networking v komunitě Promptbooku. Premium od 150 Kč měsíčně se zkušební dobou na 7 dní.',
    socialDescription:
        'Posuňte práci s AI dál: členské workshopy, exkluzivní materiály a lidé, kteří AI používají každý den.',
    socialPreviewImageAlt: 'Premium členství komunity Promptbooku',
    keywords: ['Promptbook komunita', 'premium členství', 'AI workshopy', 'AI networking', 'AI komunita'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'monthly',
};

export const COMMUNITY_MEMBERSHIP_METADATA: Metadata = createPageMetadata(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION);

export const COMMUNITY_MEMBERSHIP_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(
    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
    {
        eyebrow: 'Komunita Promptbooku',
        audienceLabel: 'Pro lidi, kteří chtějí používat AI lépe každý týden',
        bullets: ['7 dní zdarma', 'Workshopy a Q&A', 'Exkluzivní obsah'],
        stats: [
            { label: 'Premium', value: '150 Kč / měsíc' },
            { label: 'Při platbě ročně', value: '−20 %' },
            { label: 'Premium+', value: '1 000 Kč / měsíc' },
        ],
        callToActionLabel: 'Vyzkoušet Premium',
        paletteSeed: {
            backgroundStart: '#071a2a',
            backgroundEnd: '#0b4053',
            accent: '#69e6ff',
            accentSoft: '#a98bff',
        },
    },
);
