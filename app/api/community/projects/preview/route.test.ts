import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

function createPreviewRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/community/projects/preview', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('community project preview endpoint', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('scrapes Open Graph metadata and resolves a relative image URL', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                new Response(
                    `<!doctype html>
                    <html><head>
                        <meta property="og:title" content="Můj projekt">
                        <meta property="og:description" content="Krátký popis projektu">
                        <meta property="og:image" content="/preview.png">
                    </head></html>`,
                    { status: 200, headers: { 'Content-Type': 'text/html' } },
                ),
            ),
        );

        const response = await POST(createPreviewRequest({ url: 'https://example.com/project' }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            url: 'https://example.com/project',
            title: 'Můj projekt',
            description: 'Krátký popis projektu',
            imageUrl: 'https://example.com/preview.png',
        });
    });

    it('returns safe defaults when the remote page cannot be fetched', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));

        const response = await POST(createPreviewRequest({ url: 'https://example.com/project' }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({
            url: 'https://example.com/project',
            title: 'Nový projekt',
            imageUrl: null,
        });
    });

    it('rejects non-http project addresses before fetching', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const response = await POST(createPreviewRequest({ url: 'javascript:alert(1)' }));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
