import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const AI_SUPERVIZE_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/ai-supervize',
    language: 'cs',
    title: 'AI Supervize pro software týmy | Promptbook',
    socialTitle: 'AI Supervize pro software týmy',
    description:
        'Pomáháme firmám nastavit workflow, pravidla, nástroje a měření tak, aby AI opravdu pomáhala při vývoji software, místo aby přidávala chaos a riziko.',
    socialDescription:
        'Workflow, pravidla, playbook a metriky, díky kterým AI zkracuje time-to-merge místo přidávání chaosu.',
    socialPreviewImageAlt: 'AI Supervize pro software týmy - Promptbook',
    keywords: ['AI supervize', 'AI ve vývoji software', 'code review', 'vývojářské týmy', 'CTO', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.9,
};

export const AI_SUPERVIZE_METADATA: Metadata = createPageMetadata(AI_SUPERVIZE_PAGE_DEFINITION);

export const AI_SUPERVIZE_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(AI_SUPERVIZE_PAGE_DEFINITION, {
    eyebrow: 'AI pod kontrolou ve vývoji',
    artwork: 'workshop',
    paletteSeed: {
        backgroundStart: '#050b18',
        backgroundEnd: '#1b2b52',
        accent: '#8fb4ff',
        accentSoft: '#7affeb',
    },
});
