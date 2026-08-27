import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';
import { COMMUNITY_MEMBERSHIP_PATH } from './communityMembershipConfig';

export const COMMUNITY_MEMBERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_MEMBERSHIP_PATH,
    language: 'cs',
    title: 'Členství v komunitě Promptbooku | 199 Kč měsíčně',
    socialTitle: 'Komunita Promptbooku | 199 Kč měsíčně',
    description:
        'Živé AI webináře zůstávají zdarma. Za 199 Kč měsíčně získáte záznamy, materiály a další obsah.',
    socialDescription: 'Živé AI webináře zdarma. Záznamy, praktické materiály a další obsah za 199 Kč měsíčně.',
    socialPreviewImageAlt: 'Členství v komunitě Promptbooku za 199 Kč měsíčně',
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'monthly',
};

export const COMMUNITY_MEMBERSHIP_METADATA: Metadata = {
    ...createPageMetadata(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION),
    // Personalized links may include an e-mail address. Even same-origin referrers therefore expose only the origin.
    referrer: 'origin',
};

export const COMMUNITY_MEMBERSHIP_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(
    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
    {
        eyebrow: 'Komunita Promptbooku',
        audienceLabel: 'Pro vývojáře, tvůrce a malé firmy',
        bullets: ['Živé AI webináře zdarma', 'Záznamy včetně archivu', 'Praktické materiály a další obsah'],
        stats: [
            { label: 'Živě', value: 'zdarma' },
            { label: 'Členství', value: '199 Kč / měs.' },
            { label: 'Zrušení', value: 'kdykoli' },
        ],
        callToActionLabel: 'Stát se členem',
        paletteSeed: {
            backgroundStart: '#061923',
            backgroundEnd: '#12384a',
            accent: '#7aebff',
            accentSoft: '#a78bfa',
        },
    },
);
