import { COMMUNITY_PATH } from '@/businesses/community/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

/**
 * This member room is intentionally Czech-only for now. It has no `languageAlternates` yet, so a future English
 * variant can be added explicitly instead of advertising a non-existent route to browsers and search engines.
 */
export const COMMUNITY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_PATH,
    language: 'cs',
    title: 'Komunita Promptbooku',
    description: 'Soukromá komunitní místnost účastníků workshopů Promptbooku.',
    isIndexed: false,
};

export const COMMUNITY_METADATA: Metadata = {
    ...createPageMetadata(COMMUNITY_PAGE_DEFINITION),
    // YouTube requires a referrer for its embedded player, but the query parameters can contain a participant e-mail.
    referrer: 'strict-origin-when-cross-origin',
};
