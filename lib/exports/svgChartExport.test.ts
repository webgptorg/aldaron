import { describe, expect, it } from 'vitest';
import { createSinglePicturePdf } from './svgChartExport';

/**
 * Bytes which a reader takes for a compressed picture, standing in for one the browser really made
 */
const PICTURE_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);

async function readPdfAsLatin1Text(pdf: Blob): Promise<string> {
    return Array.from(new Uint8Array(await pdf.arrayBuffer()))
        .map((byte) => String.fromCharCode(byte))
        .join('');
}

describe('createSinglePicturePdf', () => {
    it('writes a document a reader can open', async () => {
        const pdfText = await readPdfAsLatin1Text(
            createSinglePicturePdf(PICTURE_BYTES, { width: 800, height: 400 }, 'Přehled workshopu'),
        );

        expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
        expect(pdfText.endsWith('%%EOF\n')).toBe(true);
        expect(pdfText).toContain('/Filter /DCTDecode');
        expect(pdfText).toContain(`/Length ${PICTURE_BYTES.length}`);
    });

    it('points at every object it lists, so that a reader never looks for one in the wrong place', async () => {
        const pdfText = await readPdfAsLatin1Text(
            createSinglePicturePdf(PICTURE_BYTES, { width: 800, height: 400 }, 'Přehled'),
        );

        const crossReferenceOffset = Number(/startxref\n(\d+)\n/.exec(pdfText)?.[1]);
        expect(pdfText.startsWith('xref', crossReferenceOffset)).toBe(true);

        const objectOffsets = Array.from(pdfText.matchAll(/^(\d{10}) 00000 n $/gm)).map((match) => Number(match[1]));
        expect(objectOffsets).toHaveLength(6);
        objectOffsets.forEach((objectOffset, objectIndex) => {
            expect(pdfText.startsWith(`${objectIndex + 1} 0 obj`, objectOffset)).toBe(true);
        });
    });

    it('writes a name with diacritics, or with a bracket in it, as the numbers of its letters', async () => {
        const pdfText = await readPdfAsLatin1Text(
            createSinglePicturePdf(PICTURE_BYTES, { width: 100, height: 100 }, 'Př (2026)'),
        );

        // Note: The mark of UTF-16, then `P`, `ř`, a space and `(2026)`, none of which can end the name early
        expect(pdfText).toContain('/Title <FEFF005001590020002800320030003200360029>');
        expect(pdfText).not.toContain('/Title (');
    });

    it('fits the picture onto the page without stretching it out of shape', async () => {
        const pdfText = await readPdfAsLatin1Text(
            createSinglePicturePdf(PICTURE_BYTES, { width: 1000, height: 500 }, 'Graf'),
        );

        const [, pictureWidth, pictureHeight] = /\n(\d+\.\d+) 0 0 (\d+\.\d+) /.exec(pdfText) ?? [];
        expect(Number(pictureWidth) / Number(pictureHeight)).toBeCloseTo(2, 5);
        expect(Number(pictureWidth)).toBeLessThanOrEqual(842 - 2 * 24);
        expect(Number(pictureHeight)).toBeLessThanOrEqual(595 - 2 * 24);
    });
});
