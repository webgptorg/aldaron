import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';
import { COMMUNITY_MEMBERSHIP_PATH } from './communityMembershipConfig';

export const COMMUNITY_MEMBERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_MEMBERSHIP_PATH,
    language: 'cs',
    title: 'Premium členství v komunitě Promptbooku',
    socialTitle: 'Premium komunita Promptbooku',
    description:
        'Záznamy workshopů, exkluzivní materiály, přednostní dotazy a osobní setkání pro vývojáře, tvůrce a malé firmy.',
    socialDescription: 'Sedm dní zdarma. Záznamy, materiály, komunita a měsíční osobní setkání.',
    socialPreviewImageAlt: 'Premium členství v komunitě Promptbooku',
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
        bullets: ['Všechny záznamy workshopů', 'Praktické materiály a repozitáře', 'Osobní setkání každý měsíc'],
        stats: [
            { label: 'Trial', value: '7 dní zdarma' },
            { label: 'Standard', value: 'od 150 Kč / měs.' },
            { label: 'Premium', value: 'od 750 Kč / měs.' },
        ],
        callToActionLabel: 'Vyzkoušet Premium',
        paletteSeed: {
            backgroundStart: '#061923',
            backgroundEnd: '#12384a',
            accent: '#7aebff',
            accentSoft: '#a78bfa',
        },
    },
);
