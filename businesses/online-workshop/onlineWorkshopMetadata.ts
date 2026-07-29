import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const ONLINE_WORKSHOP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/cs/online-workshop',
    language: 'cs',
    title: 'Promptbook | Online workshop zdarma',
    socialTitle: 'Online workshop zdarma',
    description:
        'Jak s AI agenty psát produkční kód, aniž bys po nich všechno přepisoval. 60minutový online workshop naživo pro tech leady, CTO a vývojáře, kteří už používají Claude Code, Cursor, Copilot nebo Codex.',
    socialDescription:
        'Naživo uvidíš, kde přesně se AI agenti lámou na reálných projektech a jak z nich dostat produkční kód. Zdarma, 60 minut + Q&A.',
    socialPreviewImageAlt: 'Online workshop zdarma - Promptbook',
    keywords: ['online workshop', 'AI agenti', 'produkční kód', 'Claude Code', 'Cursor', 'Copilot', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.8,
    sitemapChangeFrequency: 'weekly',
};

export const ONLINE_WORKSHOP_METADATA: Metadata = createPageMetadata(ONLINE_WORKSHOP_PAGE_DEFINITION);

export const ONLINE_WORKSHOP_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(ONLINE_WORKSHOP_PAGE_DEFINITION, {
    eyebrow: 'Online workshop naživo',
    audienceLabel: 'Pro tech leady a CTO',
    bullets: ['Zdarma', '60 minut + Q&A', 'Naživo online'],
    stats: [
        { label: 'Téma', value: 'Produkční kód s AI agenty' },
        { label: 'Formát', value: '60 minut naživo' },
        { label: 'Cena', value: 'Zdarma' },
    ],
    callToActionLabel: 'Zaregistrovat se',
    paletteSeed: {
        backgroundStart: '#04131c',
        backgroundEnd: '#123847',
        accent: '#7aebff',
        accentSoft: '#b48fff',
    },
});
