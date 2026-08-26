import { NextResponse } from 'next/server';

const REQUEST_TIMEOUT_MS = 8000;
const MAX_HTML_LENGTH = 2_000_000;
const DEFAULT_TITLE = 'Nový projekt';
const DEFAULT_DESCRIPTION = 'Projekt sdílený v komunitě Promptbooku.';

function readMetadata(html: string, property: string, name: string): string | null {
    const escapedProperty = property.replace(':', '\\:');
    const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
    for (const metaTag of metaTags) {
        const propertyValue = metaTag.match(new RegExp(`(?:property|name)=["']${escapedProperty}["']`, 'i'));
        const nameValue = metaTag.match(new RegExp(`(?:property|name)=["']${name}["']`, 'i'));
        if (propertyValue || nameValue) {
            return metaTag.match(/content=["']([^"']*)["']/i)?.[1]?.trim() ?? null;
        }
    }
    return null;
}

function readTitle(html: string): string | null {
    return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
}

function isAllowedRemoteUrl(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    try {
        const url = new URL(value);
        return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.length > 0;
    } catch {
        return false;
    }
}

function resolveImageUrl(imageUrl: string | null, projectUrl: string): string | null {
    if (imageUrl === null) return null;
    try {
        const resolvedImageUrl = new URL(imageUrl, projectUrl);
        return resolvedImageUrl.protocol === 'http:' || resolvedImageUrl.protocol === 'https:'
            ? resolvedImageUrl.toString()
            : null;
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
    if (!isAllowedRemoteUrl(body?.url)) {
        return NextResponse.json({ error: 'Zadejte platnou webovou adresu.' }, { status: 400 });
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(body.url, {
            signal: abortController.signal,
            headers: { 'User-Agent': 'Promptbook Community Preview/1.0' },
        });
        if (!response.ok) throw new Error(`Preview returned ${response.status}`);
        const html = (await response.text()).slice(0, MAX_HTML_LENGTH);
        const imageUrl = resolveImageUrl(readMetadata(html, 'og:image', 'twitter:image'), body.url);
        return NextResponse.json({
            url: body.url,
            title: readMetadata(html, 'og:title', 'title') ?? readTitle(html) ?? DEFAULT_TITLE,
            description:
                readMetadata(html, 'og:description', 'description') ?? DEFAULT_DESCRIPTION,
            imageUrl,
        });
    } catch {
        return NextResponse.json({
            url: body.url,
            title: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            imageUrl: null,
        });
    } finally {
        clearTimeout(timeout);
    }
}
