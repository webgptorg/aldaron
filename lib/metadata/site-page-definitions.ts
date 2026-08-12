import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

/**
 * Definitions of the supporting pages which are not a landing page of any business
 *
 * Note: They all share the site wide sharing preview, because a generated card per legal page brings no value.
 */
export const BRANDING_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/branding',
    language: 'en',
    title: 'Promptbook Branding',
    description: 'Official Promptbook logos, colors, typography, and messaging for brand and partner use.',
    socialPreviewImageAlt: 'Promptbook branding guidelines',
    keywords: ['Promptbook branding', 'logo', 'brand assets', 'press kit'],
    sitemapPriority: 0.4,
    sitemapChangeFrequency: 'yearly',
};

export const CONTACT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/contact',
    language: 'en',
    title: 'Contact | Promptbook',
    description:
        'Talk to the people behind Promptbook about bringing AI agents that truly understand your business into your company.',
    sitemapPriority: 0.6,
    sitemapChangeFrequency: 'yearly',
};

/**
 * Note: The privacy policy and the terms of business are published in every language of the site, so they describe
 *       themselves in `@/lib/legal/legalPageMetadata` next to their own text. Only `/privacy` and `/terms` stay here
 *       as redirects, and a redirect needs no metadata of its own.
 */
export const DATA_DELETION_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/data-deletion',
    language: 'en',
    title: 'Data Deletion Instructions | Promptbook',
    description:
        'How to request deletion of your personal data from Promptbook and from the third-party services it integrates with.',
    sitemapPriority: 0.3,
    sitemapChangeFrequency: 'yearly',
};

export const SHORTENER_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/shortener',
    language: 'en',
    title: 'Link shortener | Promptbook',
    description: 'Internal tool for creating short Promptbook links with their own landing page and click tracking.',
    isIndexed: false,
};

export const THANK_YOU_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/dekujeme',
    language: 'cs',
    title: 'Děkujeme | Promptbook',
    description: 'Potvrzení rezervace strategického hovoru s týmem Promptbook.',
    isIndexed: false,
};

export const ADMIN_CONTACTS_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/admin/contacts',
    language: 'en',
    title: 'Contacts administration | Promptbook',
    description: 'Internal administration of the contacts collected by the Promptbook landing pages.',
    isIndexed: false,
};

export const ADMIN_WORKSHOP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/admin/workshop',
    language: 'en',
    title: 'Online workshop administration | Promptbook',
    description:
        'Internal administration of the online workshop room - its start, its stream, the unlocking of the materials and the moderation of the chat.',
    isIndexed: false,
};

export const BRANDING_METADATA: Metadata = createPageMetadata(BRANDING_PAGE_DEFINITION);
export const CONTACT_METADATA: Metadata = createPageMetadata(CONTACT_PAGE_DEFINITION);
export const DATA_DELETION_METADATA: Metadata = createPageMetadata(DATA_DELETION_PAGE_DEFINITION);
export const SHORTENER_METADATA: Metadata = createPageMetadata(SHORTENER_PAGE_DEFINITION);
export const THANK_YOU_METADATA: Metadata = createPageMetadata(THANK_YOU_PAGE_DEFINITION);
export const ADMIN_CONTACTS_METADATA: Metadata = createPageMetadata(ADMIN_CONTACTS_PAGE_DEFINITION);
export const ADMIN_WORKSHOP_METADATA: Metadata = createPageMetadata(ADMIN_WORKSHOP_PAGE_DEFINITION);
