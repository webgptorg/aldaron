import { COMMUNITY_MEMBERSHIP_PATH } from '@/businesses/community/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const COMMUNITY_MEMBERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_MEMBERSHIP_PATH,
    language: 'cs',
    title: 'Premium členství komunity Promptbooku',
    socialTitle: 'Premium členství komunity Promptbooku',
    description:
        'Záznamy workshopů, exkluzivní materiály, prioritní otázky a osobní networking pro vývojáře, tvůrce a malé podnikatele.',
    socialDescription:
        'Sedm dní zdarma, všechny záznamy workshopů a u Premium i pravidelná osobní setkání.',
    socialPreviewImageAlt: 'Premium členství komunity Promptbooku',
    keywords: ['Promptbook komunita', 'AI komunita', 'premium členství', 'AI workshopy', 'AI networking'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'monthly',
};

export const COMMUNITY_MEMBERSHIP_METADATA: Metadata = {
    ...createPageMetadata(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION),
    // Invitation links may carry a member's name and e-mail; external sites only receive this origin.
    referrer: 'strict-origin-when-cross-origin',
};

export const COMMUNITY_MEMBERSHIP_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(
    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
    {
        eyebrow: 'Promptbook > Komunita',
        audienceLabel: 'Pro vývojáře, tvůrce a malé podnikatele',
        bullets: ['7 dní zdarma', 'Záznamy a deep dives', 'Osobní setkání Premium'],
        stats: [
            { label: 'Standard', value: '150 Kč / měsíc' },
            { label: 'Roční platba', value: '−20 %' },
            { label: 'Premium', value: '1 000 Kč / měsíc' },
        ],
        callToActionLabel: 'Vyzkoušet Premium',
        paletteSeed: {
            backgroundStart: '#071a2a',
            backgroundEnd: '#12314a',
            accent: '#67e8f9',
            accentSoft: '#c084fc',
        },
    },
);
