import {
    createWorkshopMaterialTrackingUrl,
    getWorkshopMaterialLinkDestinations,
    getWorkshopMaterialShortcodeSourceApp,
    materializeWorkshopMaterialShortLinks,
    replaceWorkshopMaterialLinkDestinations,
} from '@/lib/workshops/workshopMaterialLinks';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createAdHocShortcodeLinkMock } = vi.hoisted(() => ({
    createAdHocShortcodeLinkMock: vi.fn(),
}));

vi.mock('@/lib/shortener/shortcodeLinkAdHoc', () => ({
    createAdHocShortcodeLink: createAdHocShortcodeLinkMock,
}));

afterEach(() => createAdHocShortcodeLinkMock.mockReset());

describe('workshop material tracking links', () => {
    it('adds stable workshop UTM parameters without losing existing query parameters', () => {
        const trackingUrl = createWorkshopMaterialTrackingUrl(
            'https://example.com/material?download=1&utm_source=old-source',
            'online-workshop-2026-08-20',
            'content-123',
        );

        const parsedUrl = new URL(trackingUrl);
        expect(parsedUrl.searchParams.get('download')).toBe('1');
        expect(parsedUrl.searchParams.get('utm_source')).toBe('promptbook');
        expect(parsedUrl.searchParams.get('utm_medium')).toBe('workshop');
        expect(parsedUrl.searchParams.get('utm_campaign')).toBe('online-workshop-2026-08-20');
        expect(parsedUrl.searchParams.get('utm_content')).toBe('content-123');
    });

    it('does not rewrite in-page anchors or unsupported protocols', () => {
        expect(createWorkshopMaterialTrackingUrl('#slides', 'workshop', 'content')).toBe('#slides');
        expect(createWorkshopMaterialTrackingUrl('mailto:hello@example.com', 'workshop', 'content')).toBe(
            'mailto:hello@example.com',
        );
    });

    it('finds every ordinary material link while leaving images, e-mail links, and code samples alone', () => {
        const materialMarkdown = [
            '[Inline](https://example.com/inline)',
            '<https://example.com/autolink>',
            '<a href="https://example.com/html">HTML</a>',
            '[reference]: https://example.com/reference',
            'Bare URL https://example.com/bare.',
            '![Diagram](https://example.com/image.png)',
            '[Email](mailto:hello@example.com)',
            '`[Example](https://example.com/code)`',
        ].join('\n\n');

        expect(getWorkshopMaterialLinkDestinations(materialMarkdown)).toEqual([
            'https://example.com/inline',
            'https://example.com/autolink',
            'https://example.com/html',
            'https://example.com/reference',
            'https://example.com/bare',
        ]);
    });

    it('replaces only material hrefs with their persisted short URLs', () => {
        const materialMarkdown =
            '[Inline](https://example.com/inline) and <a href="https://example.com/html">HTML</a> with https://example.com/bare and ![image](https://example.com/image.png)';
        const materialWithShortLinks = replaceWorkshopMaterialLinkDestinations(
            materialMarkdown,
            new Map([
                ['https://example.com/inline', 'https://ptbk.io/inline123'],
                ['https://example.com/html', 'https://ptbk.io/html123'],
                ['https://example.com/bare', 'https://ptbk.io/bare123'],
            ]),
        );

        expect(materialWithShortLinks).toBe(
            '[Inline](https://ptbk.io/inline123) and <a href="https://ptbk.io/html123">HTML</a> with https://ptbk.io/bare123 and ![image](https://example.com/image.png)',
        );
    });

    it('labels automatic material links by the app which created them', () => {
        expect(getWorkshopMaterialShortcodeSourceApp('workshop')).toBe('online-workshop');
        expect(getWorkshopMaterialShortcodeSourceApp('community')).toBe('community');
    });

    it('creates and returns an ad hoc short link instead of exposing a material destination', async () => {
        let mappings: readonly { readonly destination_url: string; readonly shortcode_link_id: number }[] = [];
        const mappingUpsert = vi.fn(async (values: {
            readonly destination_url: string;
            readonly shortcode_link_id: number;
        }) => {
            mappings = [
                {
                    destination_url: values.destination_url,
                    shortcode_link_id: values.shortcode_link_id,
                },
            ];
            return { error: null };
        });
        const from = vi.fn((tableName: string) => {
            if (tableName === 'workshop_content_shortcode_links') {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: mappings, error: null })) })),
                    upsert: mappingUpsert,
                };
            }

            if (tableName === 'ShortcodeLink') {
                return {
                    select: vi.fn(() => ({
                        in: vi.fn(async () => ({ data: [{ id: 44, shortcode: 'material-44' }], error: null })),
                    })),
                };
            }

            throw new Error(`Unexpected table ${tableName}`);
        });
        createAdHocShortcodeLinkMock.mockResolvedValue({
            shortcodeLink: {
                id: 44,
                createdAt: '2026-08-24T10:00:00.000Z',
                shortcode: 'material-44',
                urls: ['https://example.com/material'],
                note: null,
                landingPage: null,
                isAdHoc: true,
                sourceApp: 'online-workshop',
            },
            errorMessage: null,
        });

        const materializedLink = await materializeWorkshopMaterialShortLinks(
            { from } as unknown as SupabaseClient,
            {
                workshopSlug: 'production-ai-2026-08-24',
                workshopKind: 'workshop',
                contentBlockId: 'content-44',
                bodyMarkdown: '[Otevřít materiál](https://example.com/material?download=1)',
            },
        );

        expect(materializedLink).toEqual({
            bodyMarkdown: '[Otevřít materiál](https://ptbk.io/material-44)',
            errorMessage: null,
        });
        expect(createAdHocShortcodeLinkMock).toHaveBeenCalledWith(expect.anything(), {
            urls: [
                'https://example.com/material?download=1&utm_source=promptbook&utm_medium=workshop&utm_campaign=production-ai-2026-08-24&utm_content=content-44',
            ],
            note: 'Ad hoc material link for production-ai-2026-08-24',
            sourceApp: 'online-workshop',
        });
        expect(mappingUpsert).toHaveBeenCalledWith(
            {
                content_block_id: 'content-44',
                destination_url: 'https://example.com/material?download=1',
                shortcode_link_id: 44,
            },
            { onConflict: 'content_block_id,destination_url', ignoreDuplicates: true },
        );
    });
});
