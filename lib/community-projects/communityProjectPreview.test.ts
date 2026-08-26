import { extractCommunityProjectPreview } from '@/lib/community-projects/communityProjectPreview';
import { normalizeCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
import { describe, expect, it } from 'vitest';

describe('community project preview metadata', () => {
    it('uses Open Graph title, description, and a relative image for the project card', () => {
        const preview = extractCommunityProjectPreview(
            [
                '<html><head>',
                '<meta content="Můj chytrý projekt" property="og:title">',
                '<meta name="description" content="Krátký popis, který se použije jen když nechybí OG popis.">',
                '<meta property="og:description" content="Automatizace pro malý tým.">',
                '<meta property="og:image" content="/images/project-card.png">',
                '<title>Fallback title</title>',
                '</head></html>',
            ].join(''),
            'https://example.com/projects/one?source=community#details',
        );

        expect(preview).toEqual({
            url: 'https://example.com/projects/one?source=community',
            title: 'Můj chytrý projekt',
            description: 'Automatizace pro malý tým.',
            previewImageUrl: 'https://example.com/images/project-card.png',
        });
    });

    it('falls back to a document title and then the host without making a card invalid', () => {
        expect(extractCommunityProjectPreview('<title>  Vlastní <b>projekt</b>  </title>', 'https://app.example.cz')).toEqual({
            url: 'https://app.example.cz/',
            title: 'Vlastní projekt',
            description: '',
            previewImageUrl: null,
        });
        expect(extractCommunityProjectPreview('<html></html>', 'https://app.example.cz')).toMatchObject({
            title: 'app.example.cz',
            previewImageUrl: null,
        });
    });
});

describe('community project URL normalization', () => {
    it('keeps only public HTTP(S) addresses without credentials or fragments', () => {
        expect(normalizeCommunityProjectUrl(' https://example.com/demo#section ')).toBe('https://example.com/demo');
        expect(normalizeCommunityProjectUrl('ftp://example.com/demo')).toBeNull();
        expect(normalizeCommunityProjectUrl('https://member:secret@example.com/demo')).toBeNull();
    });
});
