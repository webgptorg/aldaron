import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import type { SocialPreviewPaletteSeed } from '@/lib/metadata/social-preview-palette';
import type { Metadata } from 'next';

/**
 * Paths of the homepage in every language it is published in
 */
const HOMEPAGE_LANGUAGE_ALTERNATES: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: '/cs',
    en: '/en',
};

/**
 * Colors shared by both language variants, so the homepage looks the same wherever it is shared
 */
const HOMEPAGE_PALETTE_SEED: SocialPreviewPaletteSeed = {
    backgroundStart: '#04131c',
    backgroundEnd: '#123847',
    accent: '#7aebff',
    accentSoft: '#7affeb',
};

export const HOMEPAGE_PAGE_DEFINITIONS: Readonly<Record<SupportedHomepageLanguage, PageMetadataDefinition>> = {
    cs: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.cs,
        language: 'cs',
        title: 'Promptbook - Okamžitý přístup ke všemu, co vaše firma kdy napsala',
        socialTitle: 'Okamžitý přístup ke všemu, co vaše firma kdy napsala',
        description:
            'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR. Česká AI platforma.',
        socialDescription:
            'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR.',
        socialPreviewImageAlt: 'Promptbook - okamžitý přístup ke všemu, co vaše firma kdy napsala',
        keywords: ['AI pro firmy', 'firemní dokumenty', 'virtuální zaměstnanec', 'GDPR', 'česká AI', 'Promptbook'],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
    en: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.en,
        language: 'en',
        title: 'Promptbook - Instant access to everything your company has ever written',
        socialTitle: 'Instant access to everything your company has ever written',
        description:
            'Upload company documents, create a virtual employee, and ask questions in natural language. No prompting, no hallucinations, 100% GDPR. A Czech AI platform.',
        socialDescription:
            'Upload company documents, create a virtual employee, and ask questions in natural language. No prompting, no hallucinations, 100% GDPR.',
        socialPreviewImageAlt: 'Promptbook - instant access to everything your company has ever written',
        keywords: ['AI for business', 'company documents', 'virtual employee', 'GDPR', 'Czech AI', 'Promptbook'],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
};

export const HOMEPAGE_METADATA: Readonly<Record<SupportedHomepageLanguage, Metadata>> = {
    cs: createPageMetadata(HOMEPAGE_PAGE_DEFINITIONS.cs),
    en: createPageMetadata(HOMEPAGE_PAGE_DEFINITIONS.en),
};

export const HOMEPAGE_SOCIAL_PREVIEW_OPTIONS: Readonly<Record<SupportedHomepageLanguage, SocialPreviewImageOptions>> = {
    cs: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.cs, {
        eyebrow: 'Česká AI platforma pro firemní data',
        audienceLabel: 'Pro české firmy',
        bullets: ['Bez promptů', 'Bez halucinací', '100% GDPR'],
        stats: [
            { label: 'Dokumenty', value: 'Až milion normostran' },
            { label: 'Odpovědi', value: 'Normální češtinou' },
            { label: 'Data', value: 'Pod Vaší kontrolou' },
        ],
        callToActionLabel: 'Hovor zdarma',
        paletteSeed: HOMEPAGE_PALETTE_SEED,
    }),
    en: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.en, {
        eyebrow: 'Czech AI platform for company data',
        audienceLabel: 'For growing companies',
        bullets: ['No prompting', 'No hallucinations', '100% GDPR'],
        stats: [
            { label: 'Documents', value: 'Up to a million pages' },
            { label: 'Answers', value: 'In plain language' },
            { label: 'Data', value: 'Stays under your control' },
        ],
        callToActionLabel: 'Book a free call',
        paletteSeed: HOMEPAGE_PALETTE_SEED,
    }),
};
