import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock } = vi.hoisted(() => ({
    findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock: vi.fn(),
}));

vi.mock('@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeTranscriptSearch', () => ({
    findAiTaKrajtaEpisodeSlugsMatchingTranscript: findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock,
}));

import { GET } from './route';

describe('AI ta Krajta transcript search endpoint', () => {
    beforeEach(() => {
        findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock.mockReset();
    });

    it('returns matching episode identifiers and never the full transcript', async () => {
        findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock.mockReturnValue(['64', '42']);

        const response = GET(new NextRequest('http://localhost/api/ai-ta-krajta/episodes/search?search=Huawei'));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ episodeSlugs: ['64', '42'] });
        expect(findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock).toHaveBeenCalledWith('Huawei');
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('refuses an unreasonably long public query before searching', () => {
        const response = GET(
            new NextRequest(`http://localhost/api/ai-ta-krajta/episodes/search?search=${'a'.repeat(201)}`),
        );

        expect(response.status).toBe(400);
        expect(findAiTaKrajtaEpisodeSlugsMatchingTranscriptMock).not.toHaveBeenCalled();
    });
});
