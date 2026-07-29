import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const FOR_INDUSTRY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/for-industry',
    language: 'en',
    title: 'AI for industrial companies | Promptbook',
    socialTitle: 'Create AI that truly understands the industry',
    description:
        'Turn technical manuals, standard operating procedures, and maintenance know-how into AI agents that give technicians and support staff instant, reliable answers.',
    socialDescription:
        'Technical manuals, standard operating procedures, and maintenance know-how in AI agents your technicians can actually rely on.',
    socialPreviewImageAlt: 'Promptbook for industry - AI that truly understands your operations',
    keywords: ['AI for industry', 'manufacturing', 'technical documentation', 'maintenance', 'SOP', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
};

export const FOR_INDUSTRY_METADATA: Metadata = createPageMetadata(FOR_INDUSTRY_PAGE_DEFINITION);

export const FOR_INDUSTRY_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(FOR_INDUSTRY_PAGE_DEFINITION, {
    eyebrow: 'AI transformation for industry',
    audienceLabel: 'For industrial operations',
    bullets: ['Technical manuals', 'Less downtime', 'Your data, your control'],
    stats: [
        { label: 'Knowledge', value: 'Manuals and SOPs on hand' },
        { label: 'Uptime', value: 'Faster troubleshooting' },
        { label: 'Support', value: 'Consistent answers' },
    ],
    callToActionLabel: 'Get started',
    paletteSeed: {
        backgroundStart: '#12100a',
        backgroundEnd: '#3d3218',
        accent: '#ffd97a',
        accentSoft: '#7aebff',
    },
});
