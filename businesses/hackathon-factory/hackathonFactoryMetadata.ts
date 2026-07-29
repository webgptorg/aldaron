import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const HACKATHON_FACTORY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/hackathon-factory',
    language: 'cs',
    title: 'Hackathon Factory | Reálné problémy, funkční výstupy',
    socialTitle: 'Hackathon Factory',
    description:
        'Hackathon Factory propojuje lidi s reálnými problémy a developery, kteří je během krátkého sprintu dotáhnou do prototypu, rozhodnutí nebo plánu.',
    socialDescription:
        'Krátké hackathon sprinty pro CTO, startupy a vývojáře. Cíl: funkční prototyp, rozhodnutí nebo plán použitelný hned další den.',
    socialPreviewImageAlt: 'Hackathon Factory - reálné problémy, funkční výstupy',
    keywords: ['hackathon', 'prototyp', 'startup', 'CTO', 'vývojáři', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
};

export const HACKATHON_FACTORY_METADATA: Metadata = createPageMetadata(HACKATHON_FACTORY_PAGE_DEFINITION);

export const HACKATHON_FACTORY_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(HACKATHON_FACTORY_PAGE_DEFINITION, {
    eyebrow: 'Reálné problémy, funkční výstupy',
    audienceLabel: 'Pro CTO a startupy',
    bullets: ['Krátké sprinty', 'Funkční prototyp', 'Použitelné hned'],
    stats: [
        { label: 'Zadání', value: 'Skutečný problém' },
        { label: 'Sprint', value: 'Pár dní, ne měsíce' },
        { label: 'Výstup', value: 'Prototyp nebo rozhodnutí' },
    ],
    callToActionLabel: 'Přihlásit problém',
    paletteSeed: {
        backgroundStart: '#1c0a12',
        backgroundEnd: '#4d1f33',
        accent: '#ff8fb4',
        accentSoft: '#ffd97a',
    },
});
