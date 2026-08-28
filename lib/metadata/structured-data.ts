import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
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
import { resolveSocialPreviewImagePath } from '@/lib/metadata/social-preview-image-path';

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
 * Describes one indexable page in the context of the site and its publisher.
 *
 * This is deliberately a generic `WebPage`, rather than pretending every
 * landing page is a richer Schema.org type it does not actually satisfy.
 */
export function createWebPageStructuredData(definition: PageMetadataDefinition): StructuredDataNode {
    const pageUrl = createAbsoluteUrl(definition.path);
    const imageUrl = createAbsoluteUrl(resolveSocialPreviewImagePath(definition));

    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: definition.title,
        description: definition.description,
        url: pageUrl,
        inLanguage: STRUCTURED_DATA_LANGUAGE_BY_LANGUAGE[definition.language],
        isPartOf: { '@id': WEBSITE_STRUCTURED_DATA_ID },
        about: { '@id': ORGANIZATION_STRUCTURED_DATA_ID },
        primaryImageOfPage: {
            '@type': 'ImageObject',
            url: imageUrl,
        },
    };
}

/**
 * Everything Schema.org needs to describe one scheduled online event.
 */
export type OnlineEventStructuredDataOptions = {
    /** Stable identifier of the event within its public page. */
    readonly id: string;
    readonly name: string;
    readonly description: string;
    /** Page where the visitor can learn about and register for the event. */
    readonly path: string;
    readonly imagePath: string;
    readonly language: SupportedHomepageLanguage;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly priceCurrency: string;
    readonly price: string;
};

/**
 * Describes a scheduled remote workshop without inventing a public detail URL
 * for the private participant room.
 */
export function createOnlineEventStructuredData(options: OnlineEventStructuredDataOptions): StructuredDataNode {
    const pageUrl = createAbsoluteUrl(options.path);

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        '@id': `${pageUrl}#event-${encodeURIComponent(options.id)}`,
        name: options.name,
        description: options.description,
        url: pageUrl,
        image: createAbsoluteUrl(options.imagePath),
        startDate: options.startsAt,
        ...(options.endsAt === null ? {} : { endDate: options.endsAt }),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
            '@type': 'VirtualLocation',
            url: pageUrl,
        },
        inLanguage: STRUCTURED_DATA_LANGUAGE_BY_LANGUAGE[options.language],
        organizer: { '@id': ORGANIZATION_STRUCTURED_DATA_ID },
        offers: {
            '@type': 'Offer',
            url: pageUrl,
            price: options.price,
            priceCurrency: options.priceCurrency,
            availability: 'https://schema.org/InStock',
        },
    };
}

/**
 * One episode of a podcast, as far as a search engine needs to know it
 */
export type PodcastEpisodeStructuredDataOptions = {
    readonly name: string;

    /**
     * Address which plays this exact episode, which is the page of the show with the episode chosen
     */
    readonly url: string;

    /**
     * Address of the recording itself
     */
    readonly audioUrl: string;

    /**
     * Moment the episode was published, as an ISO 8601 string
     */
    readonly publishedAt: string;

    readonly episodeNumber: number | null;
    readonly durationInSeconds: number | null;
};

/**
 * Everything needed to describe a podcast published by the site
 */
export type PodcastSeriesStructuredDataOptions = {
    readonly name: string;
    readonly description: string;
    readonly path: string;
    readonly imagePath: string;
    readonly language: SupportedHomepageLanguage;

    /**
     * Who makes the show, which is a person for a solo show and an organization for a show with a rotating lineup
     */
    readonly author: {
        readonly name: string;
        readonly type: 'Person' | 'Organization';
    };

    /**
     * Places the very same podcast can be watched or listened to, for example its YouTube channel
     */
    readonly channelUrls: readonly string[];

    /**
     * Episodes worth listing, usually the newest ones rather than the whole archive
     */
    readonly episodes?: readonly PodcastEpisodeStructuredDataOptions[];
};

/**
 * Writes a length of a recording as the ISO 8601 duration schema.org expects, for example `PT35M34S`
 */
function createIsoDuration(durationInSeconds: number): string {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    return `PT${hours === 0 ? '' : `${hours}H`}${minutes === 0 ? '' : `${minutes}M`}${seconds}S`;
}

/**
 * Describes one episode of a podcast
 *
 * @see https://schema.org/PodcastEpisode
 */
function createPodcastEpisodeStructuredData(episode: PodcastEpisodeStructuredDataOptions): StructuredDataNode {
    return {
        '@type': 'PodcastEpisode',
        name: episode.name,
        url: episode.url,
        datePublished: episode.publishedAt,
        ...(episode.episodeNumber === null ? {} : { episodeNumber: episode.episodeNumber }),
        associatedMedia: {
            '@type': 'AudioObject',
            contentUrl: episode.audioUrl,
            encodingFormat: 'audio/mpeg',
            ...(episode.durationInSeconds === null ? {} : { duration: createIsoDuration(episode.durationInSeconds) }),
        },
    };
}

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
            '@type': options.author.type,
            name: options.author.name,
        },
        publisher: { '@id': ORGANIZATION_STRUCTURED_DATA_ID },
        ...(options.episodes === undefined
            ? {}
            : { episode: options.episodes.map(createPodcastEpisodeStructuredData) }),
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
