import {
    ONLINE_WORKSHOP_PARTICIPANT_PATH,
    ONLINE_WORKSHOP_PATH,
    ONLINE_WORKSHOP_THANK_YOU_PATH,
} from '@/businesses/online-workshop/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const ONLINE_WORKSHOP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ONLINE_WORKSHOP_PATH,
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

/**
 * Note: The page confirms a registration which already happened, it has nothing to offer to a visitor arriving from
 *       search, so it stays out of the search results and out of the sitemap.
 */
export const ONLINE_WORKSHOP_THANK_YOU_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ONLINE_WORKSHOP_THANK_YOU_PATH,
    language: 'cs',
    title: 'Promptbook | Registrace na online workshop potvrzena',
    socialTitle: 'Registrace na online workshop potvrzena',
    description: 'Potvrzení registrace na bezplatný online workshop o psaní produkčního kódu s AI agenty.',
    isIndexed: false,
};

/**
 * Note: The room of the workshop belongs to the registered participants, a visitor arriving from search would only
 *       find a countdown, so it stays out of the search results and out of the sitemap.
 */
export const ONLINE_WORKSHOP_PARTICIPANT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ONLINE_WORKSHOP_PARTICIPANT_PATH,
    language: 'cs',
    title: 'Promptbook | Online workshop naživo',
    socialTitle: 'Online workshop naživo',
    description: 'Živé vysílání, materiály a chat bezplatného online workshopu o psaní produkčního kódu s AI agenty.',
    isIndexed: false,
};

export const ONLINE_WORKSHOP_METADATA: Metadata = createPageMetadata(ONLINE_WORKSHOP_PAGE_DEFINITION);

export const ONLINE_WORKSHOP_THANK_YOU_METADATA: Metadata = createPageMetadata(
    ONLINE_WORKSHOP_THANK_YOU_PAGE_DEFINITION,
);

export const ONLINE_WORKSHOP_PARTICIPANT_METADATA: Metadata = createPageMetadata(
    ONLINE_WORKSHOP_PARTICIPANT_PAGE_DEFINITION,
);

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
