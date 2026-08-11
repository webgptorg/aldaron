import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import {
    ORGANIZATION_COUNTRY_CODE,
    ORGANIZATION_LEGAL_NAME,
    ORGANIZATION_REGISTRATION_NUMBER,
    ORGANIZATION_SOCIAL_URLS,
    SITE_DESCRIPTION,
    SITE_LOGO_PATH,
    SITE_NAME,
    SITE_URL,
    STRUCTURED_DATA_LANGUAGE_BY_LANGUAGE,
    createAbsoluteUrl,
} from '@/lib/metadata/site-config';

/**
 * Any schema.org node which can be embedded as JSON-LD
 */
export type StructuredDataNode = Record<string, unknown>;

/**
 * Stable identifier of the organization node, so other nodes can reference it instead of repeating it
 */
const ORGANIZATION_STRUCTURED_DATA_ID = `${SITE_URL}/#organization`;

/**
 * Stable identifier of the website node
 */
const WEBSITE_STRUCTURED_DATA_ID = `${SITE_URL}/#website`;

/**
 * Describes the company behind the site for search engines and knowledge panels
 *
 * @see https://schema.org/Organization
 */
export function createOrganizationStructuredData(): StructuredDataNode {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': ORGANIZATION_STRUCTURED_DATA_ID,
        name: SITE_NAME,
        legalName: ORGANIZATION_LEGAL_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        logo: createAbsoluteUrl(SITE_LOGO_PATH),
        sameAs: [...ORGANIZATION_SOCIAL_URLS],
        address: {
            '@type': 'PostalAddress',
            addressCountry: ORGANIZATION_COUNTRY_CODE,
        },
        identifier: {
            '@type': 'PropertyValue',
            name: 'IČO',
            value: ORGANIZATION_REGISTRATION_NUMBER,
        },
    };
}

/**
 * Describes the site itself, which lets search engines attribute the brand name to the domain
 *
 * @see https://schema.org/WebSite
 */
export function createWebSiteStructuredData(): StructuredDataNode {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': WEBSITE_STRUCTURED_DATA_ID,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        inLanguage: Object.values(STRUCTURED_DATA_LANGUAGE_BY_LANGUAGE),
        publisher: { '@id': ORGANIZATION_STRUCTURED_DATA_ID },
    };
}

/**
 * Everything needed to describe a podcast published by the site
 */
export type PodcastSeriesStructuredDataOptions = {
    readonly name: string;
    readonly description: string;
    readonly path: string;
    readonly imagePath: string;
    readonly language: SupportedHomepageLanguage;
    readonly authorName: string;

    /**
     * Places the very same podcast can be watched or listened to, for example its YouTube channel
     */
    readonly channelUrls: readonly string[];
};

/**
 * Describes a podcast, which lets search engines present it as a show rather than as one more page
 *
 * @see https://schema.org/PodcastSeries
 */
export function createPodcastSeriesStructuredData(options: PodcastSeriesStructuredDataOptions): StructuredDataNode {
    return {
        '@context': 'https://schema.org',
        '@type': 'PodcastSeries',
        name: options.name,
        description: options.description,
        url: createAbsoluteUrl(options.path),
        image: createAbsoluteUrl(options.imagePath),
        inLanguage: STRUCTURED_DATA_LANGUAGE_BY_LANGUAGE[options.language],
        sameAs: [...options.channelUrls],
        author: {
            '@type': 'Person',
            name: options.authorName,
        },
        publisher: { '@id': ORGANIZATION_STRUCTURED_DATA_ID },
    };
}

/**
 * Everything needed to describe a person behind a personal page
 */
export type PersonStructuredDataOptions = {
    readonly name: string;
    readonly jobTitle: string;
    readonly description: string;
    readonly path: string;
    readonly imagePath: string;
    readonly socialUrls: readonly string[];
};

/**
 * Describes a person behind a personal page
 *
 * @see https://schema.org/Person
 */
export function createPersonStructuredData(options: PersonStructuredDataOptions): StructuredDataNode {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: options.name,
        jobTitle: options.jobTitle,
        description: options.description,
        url: createAbsoluteUrl(options.path),
        image: createAbsoluteUrl(options.imagePath),
        sameAs: [...options.socialUrls],
        worksFor: { '@id': ORGANIZATION_STRUCTURED_DATA_ID },
    };
}
