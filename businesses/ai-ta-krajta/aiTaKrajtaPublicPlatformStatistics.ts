import {
    AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL,
    AI_TA_KRAJTA_INSTAGRAM_URL,
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_SPOTIFY_SHOW_URL,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
} from '@/businesses/ai-ta-krajta/config';
import { fetchCachedText } from '@/lib/network/fetchCachedText';

const HTML_DOCUMENT_MEDIA_TYPES = 'text/html, application/xhtml+xml;q=0.9';
const ONE_THOUSAND = 1_000;
const ONE_MILLION = 1_000_000;

const THOUSAND_COUNT_SUFFIX_PATTERN = /(?:\btis\.?|\btisíc(?:e|ů)?\b|\d[\d\s.,]*k\b)/i;
const MILLION_COUNT_SUFFIX_PATTERN = /(?:\bmil\.?|\bmilion(?:y|ů)?\b|\d[\d\s.,]*m\b)/i;
const FIRST_COUNT_PATTERN = /(\d[\d\s\u00a0.,]*)/;
const LINKEDIN_FOLLOWER_COUNT_PATTERN = /\|\s*([\d\s\u00a0.,]+)/;
const INSTAGRAM_FOLLOWER_COUNT_PATTERN = /^\s*([\d\s\u00a0.,]+)/;

/**
 * Public audience signals which the linked profiles reveal without signing in.
 *
 * Note: Spotify and Apple Podcasts deliberately do not reveal their subscriber or play totals on their public show
 * pages. Their availability is still retained, because it lets the aggregate include the audio distribution instead
 * of treating YouTube as the entire show.
 */
export type AiTaKrajtaPublicPlatformStatistics = {
    readonly youtubeSubscriberCount: number | null;
    readonly youtubeViewCount: number | null;
    readonly youtubeVideoCount: number | null;
    readonly linkedInFollowerCount: number | null;
    readonly instagramFollowerCount: number | null;
    readonly applePodcastReviewCount: number | null;
    readonly isSpotifyShowAvailable: boolean;
    readonly isApplePodcastsShowAvailable: boolean;
};

/**
 * Writes the stable public address of the about tab, where YouTube exposes the channel-wide counts.
 */
export function createAiTaKrajtaYoutubeAboutUrl(channelUrl: string): string {
    return `${channelUrl.replace(/\/$/, '')}/about`;
}

/**
 * Protects a literal field or meta-property name before it becomes part of a regular expression.
 */
function escapeRegularExpression(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reads one JSON string property out of a document whose application state is serialized into a script tag.
 */
function readJsonStringProperty(documentText: string, propertyName: string): string | null {
    const escapedPropertyName = escapeRegularExpression(propertyName);
    const propertyPattern = new RegExp(`"${escapedPropertyName}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`);
    const propertyValue = propertyPattern.exec(documentText)?.[1];

    if (propertyValue === undefined) {
        return null;
    }

    try {
        return JSON.parse(`"${propertyValue}"`) as string;
    } catch {
        return null;
    }
}

/**
 * Reads one whole-number JSON property out of a document whose application state is serialized into a script tag.
 */
function readJsonCountProperty(documentText: string, propertyName: string): number | null {
    const escapedPropertyName = escapeRegularExpression(propertyName);
    const propertyPattern = new RegExp(`"${escapedPropertyName}"\\s*:\\s*(\\d+)`);
    const propertyValue = propertyPattern.exec(documentText)?.[1];

    return propertyValue === undefined ? null : parseAiTaKrajtaPublicCount(propertyValue);
}

/**
 * Reads the value of an Open Graph meta-property regardless of the order of the HTML attributes.
 */
function readMetaPropertyContent(documentText: string, propertyName: string): string | null {
    const escapedPropertyName = escapeRegularExpression(propertyName);
    const metaPropertyPattern = new RegExp(
        `<meta\\b(?=[^>]*\\bproperty\\s*=\\s*["']${escapedPropertyName}["'])(?=[^>]*\\bcontent\\s*=\\s*["']([^"']*)["'])[^>]*>`,
        'i',
    );

    return metaPropertyPattern.exec(documentText)?.[1] ?? null;
}

/**
 * Whether a public document identifies the expected schema type.
 */
function hasSchemaType(documentText: string, schemaType: string): boolean {
    const escapedSchemaType = escapeRegularExpression(schemaType);
    const schemaTypePattern = new RegExp(`"@type"\\s*:\\s*"${escapedSchemaType}"`);

    return schemaTypePattern.test(documentText);
}

/**
 * Turns counts as platforms display them, including Czech `1,84 tis.` and English `1.84K`, into whole numbers.
 */
export function parseAiTaKrajtaPublicCount(countText: string | null): number | null {
    if (countText === null) {
        return null;
    }

    const numberText = FIRST_COUNT_PATTERN.exec(countText)?.[1];

    if (numberText === undefined) {
        return null;
    }

    const countMultiplier = MILLION_COUNT_SUFFIX_PATTERN.test(countText)
        ? ONE_MILLION
        : THOUSAND_COUNT_SUFFIX_PATTERN.test(countText)
          ? ONE_THOUSAND
          : 1;
    const compactNumberText = numberText.replace(/[\s\u00a0]/g, '');

    const count =
        countMultiplier === 1
            ? Number(compactNumberText.replace(/[^\d]/g, ''))
            : Number(compactNumberText.replace(',', '.')) * countMultiplier;

    return Number.isFinite(count) && count >= 0 ? Math.round(count) : null;
}

/**
 * Reads the three channel-wide statistics which YouTube publishes on its public about tab.
 */
export function parseAiTaKrajtaYoutubeChannelStatistics(
    documentText: string | null,
): Pick<AiTaKrajtaPublicPlatformStatistics, 'youtubeSubscriberCount' | 'youtubeViewCount' | 'youtubeVideoCount'> {
    if (documentText === null) {
        return {
            youtubeSubscriberCount: null,
            youtubeViewCount: null,
            youtubeVideoCount: null,
        };
    }

    return {
        youtubeSubscriberCount: parseAiTaKrajtaPublicCount(readJsonStringProperty(documentText, 'subscriberCountText')),
        youtubeViewCount: parseAiTaKrajtaPublicCount(readJsonStringProperty(documentText, 'viewCountText')),
        youtubeVideoCount: parseAiTaKrajtaPublicCount(readJsonStringProperty(documentText, 'videoCountText')),
    };
}

/**
 * Reads the follower total LinkedIn makes public in the profile's Open Graph description.
 */
export function parseAiTaKrajtaLinkedInFollowerCount(documentText: string | null): number | null {
    if (documentText === null) {
        return null;
    }

    const description = readMetaPropertyContent(documentText, 'og:description');
    const followerCountText =
        description === null ? null : (LINKEDIN_FOLLOWER_COUNT_PATTERN.exec(description)?.[1] ?? null);

    return parseAiTaKrajtaPublicCount(followerCountText);
}

/**
 * Reads the follower total Instagram makes public in the profile's Open Graph description.
 */
export function parseAiTaKrajtaInstagramFollowerCount(documentText: string | null): number | null {
    if (documentText === null) {
        return null;
    }

    const description = readMetaPropertyContent(documentText, 'og:description');
    const followerCountText =
        description === null ? null : (INSTAGRAM_FOLLOWER_COUNT_PATTERN.exec(description)?.[1] ?? null);

    return parseAiTaKrajtaPublicCount(followerCountText);
}

/**
 * Reads the number of listeners who publicly reviewed the Apple Podcasts show.
 */
export function parseAiTaKrajtaApplePodcastReviewCount(documentText: string | null): number | null {
    return documentText === null ? null : readJsonCountProperty(documentText, 'reviewCount');
}

/**
 * Reads every publicly available platform signal in parallel.
 *
 * Note: `fetchCachedText` is the cache boundary. It gives each remote document the same server-side revalidation
 * window as the page, so a burst of page visits never becomes a burst of requests to the platforms.
 */
export async function fetchAiTaKrajtaPublicPlatformStatistics(
    revalidateSeconds: number,
): Promise<AiTaKrajtaPublicPlatformStatistics> {
    const [
        youtubeAboutDocument,
        spotifyShowDocument,
        applePodcastsShowDocument,
        linkedInProfileDocument,
        instagramProfileDocument,
    ] = await Promise.all([
        fetchCachedText({
            url: createAiTaKrajtaYoutubeAboutUrl(AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL),
            revalidateSeconds,
            acceptedMediaTypes: HTML_DOCUMENT_MEDIA_TYPES,
        }),
        fetchCachedText({
            url: AI_TA_KRAJTA_SPOTIFY_SHOW_URL,
            revalidateSeconds,
            acceptedMediaTypes: HTML_DOCUMENT_MEDIA_TYPES,
        }),
        fetchCachedText({
            url: AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL,
            revalidateSeconds,
            acceptedMediaTypes: HTML_DOCUMENT_MEDIA_TYPES,
        }),
        fetchCachedText({
            url: AI_TA_KRAJTA_LINKEDIN_URL,
            revalidateSeconds,
            acceptedMediaTypes: HTML_DOCUMENT_MEDIA_TYPES,
        }),
        fetchCachedText({
            url: AI_TA_KRAJTA_INSTAGRAM_URL,
            revalidateSeconds,
            acceptedMediaTypes: HTML_DOCUMENT_MEDIA_TYPES,
        }),
    ]);
    const youtubeStatistics = parseAiTaKrajtaYoutubeChannelStatistics(youtubeAboutDocument);

    return {
        ...youtubeStatistics,
        linkedInFollowerCount: parseAiTaKrajtaLinkedInFollowerCount(linkedInProfileDocument),
        instagramFollowerCount: parseAiTaKrajtaInstagramFollowerCount(instagramProfileDocument),
        applePodcastReviewCount: parseAiTaKrajtaApplePodcastReviewCount(applePodcastsShowDocument),
        isSpotifyShowAvailable: spotifyShowDocument !== null && hasSchemaType(spotifyShowDocument, 'PodcastSeries'),
        isApplePodcastsShowAvailable:
            applePodcastsShowDocument !== null && hasSchemaType(applePodcastsShowDocument, 'CreativeWorkSeries'),
    };
}
