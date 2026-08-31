import { COMMUNITY_PATH } from '@/businesses/community/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

/**
 * This member room is intentionally Czech-only for now. It has no `languageAlternates` yet, so a future English
 * variant can be added explicitly instead of advertising a non-existent route to browsers and search engines.
 */
export const COMMUNITY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_PATH,
    language: 'cs',
    title: 'Komunita Promptbooku | Workshopy, materiály a diskuze',
    socialTitle: 'Komunita Promptbooku',
    description: 'Soukromá komunitní místnost účastníků workshopů Promptbooku.',
    socialDescription: 'Navazující workshopy, materiály a diskuze pro účastníky komunity Promptbooku.',
    socialPreviewImageAlt: 'Komunita Promptbooku - workshopy, materiály a diskuze',
    isSocialPreviewImageGenerated: true,
    isIndexed: false,
};

export const COMMUNITY_METADATA: Metadata = {
    ...createPageMetadata(COMMUNITY_PAGE_DEFINITION),
    // An invitation link can carry a participant e-mail in its query parameters, so nothing outside this site learns
    // more than the origin the visitor came from.
    referrer: 'strict-origin-when-cross-origin',
};

/**
 * A safe, fixed card for invitation links. It intentionally says nothing
 * about a member, an active workshop, or a private room query parameter.
 */
export const COMMUNITY_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(COMMUNITY_PAGE_DEFINITION, {
    eyebrow: 'Komunita Promptbooku',
    artwork: 'community',
    paletteSeed: {
        backgroundStart: '#071a2a',
        backgroundEnd: '#0b4053',
        accent: '#69e6ff',
        accentSoft: '#a98bff',
    },
});
