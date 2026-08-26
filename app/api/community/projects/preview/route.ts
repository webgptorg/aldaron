import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest, NextResponse } from 'next/server';

function readMeta(document: string, name: string): string | null {
    const expression = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
    return document.match(expression)?.[1]?.trim() ?? null;
}

export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) return crossSiteResponse;
    const body = await readJsonObjectOrNull(request);
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    try { const parsedUrl = new URL(url); if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error(); } catch { return NextResponse.json({ error: 'Zadejte platnou URL.' }, { status: 400 }); }
    try {
        const response = await fetch(url, { headers: { 'user-agent': 'Promptbook community preview bot' }, signal: AbortSignal.timeout(8000), next: { revalidate: 300 } });
        const html = await response.text();
        return NextResponse.json({ url, title: readMeta(html, 'og:title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? url, description: readMeta(html, 'og:description') ?? readMeta(html, 'description') ?? '', ogImageUrl: readMeta(html, 'og:image') });
    } catch { return NextResponse.json({ url, title: url, description: '', ogImageUrl: null }); }
}
