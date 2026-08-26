import { normalizeCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
import type { CommunityProjectPreview } from '@/lib/community-projects/communityProjectTypes';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const COMMUNITY_PROJECT_PREVIEW_REQUEST_TIMEOUT_MILLISECONDS = 10_000;
const MAXIMAL_COMMUNITY_PROJECT_PREVIEW_HTML_BYTES = 1_000_000;
const MAXIMAL_COMMUNITY_PROJECT_PREVIEW_REDIRECT_COUNT = 4;
const COMMUNITY_PROJECT_PREVIEW_USER_AGENT = 'Promptbook Community Project Preview/1.0';
const HTML_META_TAG_PATTERN = /<meta\b[^>]*>/gi;
const HTML_ATTRIBUTE_PATTERN = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
const HTML_TITLE_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title>/i;

export class CommunityProjectPreviewError extends Error {}

type HtmlAttributes = Readonly<Record<string, string>>;

function normalizeMetadataText(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseHtmlAttributes(htmlTag: string): HtmlAttributes {
    const attributes: Record<string, string> = {};
    let attributeMatch: RegExpExecArray | null;

    while ((attributeMatch = HTML_ATTRIBUTE_PATTERN.exec(htmlTag)) !== null) {
        const attributeName = attributeMatch[1].toLowerCase();
        const attributeValue = attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? '';
        attributes[attributeName] = attributeValue;
    }

    return attributes;
}

function getMetadataValue(html: string, names: readonly string[]): string | null {
    // The requested order is meaningful: Open Graph is the card contract, while a plain document description is only
    // a fallback. Looking for one name at a time prevents an earlier generic tag from winning over a later OG tag.
    for (const name of names) {
        HTML_META_TAG_PATTERN.lastIndex = 0;
        let metaTagMatch: RegExpExecArray | null;
        while ((metaTagMatch = HTML_META_TAG_PATTERN.exec(html)) !== null) {
            const attributes = parseHtmlAttributes(metaTagMatch[0]);
            const metadataName = attributes.property ?? attributes.name;
            const content = attributes.content;
            if (metadataName?.toLowerCase() !== name.toLowerCase() || content === undefined) {
                continue;
            }

            const normalizedContent = normalizeMetadataText(content);
            if (normalizedContent !== '') {
                return normalizedContent;
            }
        }
    }

    return null;
}

function getHtmlTitle(html: string): string | null {
    const titleMatch = html.match(HTML_TITLE_PATTERN);
    if (titleMatch === null) {
        return null;
    }

    const title = normalizeMetadataText(titleMatch[1]);
    return title === '' ? null : title;
}

function resolvePreviewImageUrl(value: string | null, pageUrl: string): string | null {
    if (value === null) {
        return null;
    }

    try {
        const imageUrl = new URL(value, pageUrl);
        return normalizeCommunityProjectUrl(imageUrl.toString());
    } catch {
        return null;
    }
}

/**
 * Extracts the card metadata from an already-fetched page. Keeping parsing separate from network access makes the
 * browser-independent rules testable and keeps both wizard requests on the exact same fallback behavior.
 */
export function extractCommunityProjectPreview(html: string, pageUrl: string): CommunityProjectPreview {
    const normalizedUrl = normalizeCommunityProjectUrl(pageUrl);
    if (normalizedUrl === null) {
        throw new CommunityProjectPreviewError('Project URL is invalid');
    }

    const fallbackTitle = new URL(normalizedUrl).hostname;
    const title = getMetadataValue(html, ['og:title', 'twitter:title']) ?? getHtmlTitle(html) ?? fallbackTitle;
    const description = getMetadataValue(html, ['og:description', 'twitter:description', 'description']) ?? '';
    const previewImageUrl = resolvePreviewImageUrl(
        getMetadataValue(html, ['og:image', 'twitter:image']),
        normalizedUrl,
    );

    return {
        url: normalizedUrl,
        title: title.slice(0, 200),
        description: description.slice(0, 2_000),
        previewImageUrl,
    };
}

function getIpAddressParts(address: string): readonly number[] | null {
    const parts = address.split('.');
    if (parts.length !== 4) {
        return null;
    }

    const numericParts = parts.map((part) => Number(part));
    return numericParts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) ? numericParts : null;
}

function isPrivateIpv4Address(address: string): boolean {
    const parts = getIpAddressParts(address);
    if (parts === null) {
        return true;
    }

    const [firstPart, secondPart] = parts;
    return (
        firstPart === 0 ||
        firstPart === 10 ||
        firstPart === 127 ||
        (firstPart === 100 && secondPart >= 64 && secondPart <= 127) ||
        (firstPart === 169 && secondPart === 254) ||
        (firstPart === 172 && secondPart >= 16 && secondPart <= 31) ||
        (firstPart === 192 && secondPart === 168) ||
        (firstPart === 198 && (secondPart === 18 || secondPart === 19)) ||
        firstPart >= 224
    );
}

function isPrivateIpv6Address(address: string): boolean {
    const normalizedAddress = address.toLowerCase();
    if (normalizedAddress === '::' || normalizedAddress === '::1') {
        return true;
    }

    if (normalizedAddress.startsWith('fc') || normalizedAddress.startsWith('fd') || normalizedAddress.startsWith('fe80:')) {
        return true;
    }

    const mappedIpv4Address = normalizedAddress.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return mappedIpv4Address === undefined ? false : isPrivateIpv4Address(mappedIpv4Address);
}

function isPrivateIpAddress(address: string): boolean {
    return isIP(address) === 4 ? isPrivateIpv4Address(address) : isPrivateIpv6Address(address);
}

function getHostnameWithoutIpv6Brackets(hostname: string): string {
    return hostname.replace(/^\[/, '').replace(/\]$/, '');
}

async function assertPublicProjectUrl(url: string): Promise<void> {
    const parsedUrl = new URL(url);
    const hostname = getHostnameWithoutIpv6Brackets(parsedUrl.hostname);
    if (hostname.toLowerCase() === 'localhost') {
        throw new CommunityProjectPreviewError('Project URL must be publicly reachable');
    }

    if (isIP(hostname) !== 0) {
        if (isPrivateIpAddress(hostname)) {
            throw new CommunityProjectPreviewError('Project URL must be publicly reachable');
        }
        return;
    }

    let addressRecords: Awaited<ReturnType<typeof lookup>>[];
    try {
        addressRecords = await lookup(hostname, { all: true, verbatim: true });
    } catch {
        throw new CommunityProjectPreviewError('Project URL could not be resolved');
    }

    if (addressRecords.length === 0 || addressRecords.some((addressRecord) => isPrivateIpAddress(addressRecord.address))) {
        throw new CommunityProjectPreviewError('Project URL must be publicly reachable');
    }
}

async function readPreviewHtml(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (reader === undefined) {
        return '';
    }

    const decoder = new TextDecoder();
    let byteCount = 0;
    let html = '';

    while (true) {
        const readResult = await reader.read();
        if (readResult.done) {
            break;
        }

        byteCount += readResult.value.byteLength;
        if (byteCount > MAXIMAL_COMMUNITY_PROJECT_PREVIEW_HTML_BYTES) {
            await reader.cancel();
            throw new CommunityProjectPreviewError('Project page is too large to preview');
        }

        html += decoder.decode(readResult.value, { stream: true });
    }

    return html + decoder.decode();
}

async function fetchCommunityProjectHtml(initialUrl: string): Promise<{ readonly html: string; readonly url: string }> {
    let currentUrl = initialUrl;

    for (let redirectCount = 0; redirectCount <= MAXIMAL_COMMUNITY_PROJECT_PREVIEW_REDIRECT_COUNT; redirectCount += 1) {
        await assertPublicProjectUrl(currentUrl);

        const abortController = new AbortController();
        const timeoutId = setTimeout(
            () => abortController.abort(),
            COMMUNITY_PROJECT_PREVIEW_REQUEST_TIMEOUT_MILLISECONDS,
        );
        let response: Response;
        try {
            response = await fetch(currentUrl, {
                method: 'GET',
                redirect: 'manual',
                signal: abortController.signal,
                headers: {
                    Accept: 'text/html,application/xhtml+xml',
                    'User-Agent': COMMUNITY_PROJECT_PREVIEW_USER_AGENT,
                },
            });
        } catch {
            throw new CommunityProjectPreviewError('Project page could not be loaded');
        } finally {
            clearTimeout(timeoutId);
        }

        if (response.status >= 300 && response.status < 400) {
            const redirectLocation = response.headers.get('location');
            if (redirectLocation === null || redirectCount === MAXIMAL_COMMUNITY_PROJECT_PREVIEW_REDIRECT_COUNT) {
                throw new CommunityProjectPreviewError('Project page redirects too many times');
            }

            const redirectedUrl = normalizeCommunityProjectUrl(new URL(redirectLocation, currentUrl).toString());
            if (redirectedUrl === null) {
                throw new CommunityProjectPreviewError('Project page redirects to an unsupported URL');
            }

            currentUrl = redirectedUrl;
            continue;
        }

        if (!response.ok) {
            throw new CommunityProjectPreviewError('Project page could not be loaded');
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
            throw new CommunityProjectPreviewError('Project URL does not point to an HTML page');
        }

        return { html: await readPreviewHtml(response), url: currentUrl };
    }

    throw new CommunityProjectPreviewError('Project page redirects too many times');
}

/**
 * Fetches a public project page and turns its Open Graph data into the wizard defaults and card preview.
 */
export async function scrapeCommunityProjectPreview(value: string): Promise<CommunityProjectPreview> {
    const normalizedUrl = normalizeCommunityProjectUrl(value);
    if (normalizedUrl === null) {
        throw new CommunityProjectPreviewError('Project URL is invalid');
    }

    const { html, url } = await fetchCommunityProjectHtml(normalizedUrl);
    return extractCommunityProjectPreview(html, url);
}
