import {
    createAiTaKrajtaEpisodePath,
    DEFAULT_AI_TA_KRAJTA_VIEW_STATE,
    parseAiTaKrajtaViewState,
    serializeAiTaKrajtaViewState,
    type AiTaKrajtaViewState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { describe, expect, it } from 'vitest';

function serializeToSearch(viewState: AiTaKrajtaViewState): string {
    return serializeAiTaKrajtaViewState(viewState, new URLSearchParams()).toString();
}

describe('aiTaKrajtaViewState', () => {
    it('opens the page on the whole archive when the link carries nothing', () => {
        expect(parseAiTaKrajtaViewState(new URLSearchParams())).toEqual(DEFAULT_AI_TA_KRAJTA_VIEW_STATE);
    });

    it('leaves out of the link everything which is still the default', () => {
        expect(serializeToSearch(DEFAULT_AI_TA_KRAJTA_VIEW_STATE)).toBe('');
    });

    it('carries the whole view, so that the copied link opens the same page', () => {
        const viewState: AiTaKrajtaViewState = {
            personId: 'jiri-jahn',
            searchQuery: 'lokální modely',
            playingEpisodeSlug: '64',
            isPlaying: true,
            isWholeArchiveShown: true,
            isGamePlayed: true,
            collaborationKind: 'partnerstvi',
        };

        expect(parseAiTaKrajtaViewState(new URLSearchParams(serializeToSearch(viewState)))).toEqual(viewState);
    });

    it('ignores a filter for somebody who is not in the roster', () => {
        expect(parseAiTaKrajtaViewState(new URLSearchParams('osoba=nekdo-jiny')).personId).toBeNull();
    });

    it('ignores a kind of collaboration which the form does not offer', () => {
        expect(parseAiTaKrajtaViewState(new URLSearchParams('zajem=cokoliv')).collaborationKind).toBe(
            DEFAULT_AI_TA_KRAJTA_VIEW_STATE.collaborationKind,
        );
    });

    it('keeps the query parameters which belong to somebody else', () => {
        const searchParams = serializeAiTaKrajtaViewState(
            { ...DEFAULT_AI_TA_KRAJTA_VIEW_STATE, personId: 'pavol-hejny' },
            new URLSearchParams('utm_source=linkedin'),
        );

        expect(searchParams.get('utm_source')).toBe('linkedin');
        expect(searchParams.get('osoba')).toBe('pavol-hejny');
    });

    it('builds a link which opens one episode and plays it', () => {
        const episodePath = createAiTaKrajtaEpisodePath('64');
        const viewState = parseAiTaKrajtaViewState(new URLSearchParams(episodePath.split('?')[1]));

        expect(episodePath.startsWith('/ai-ta-krajta?')).toBe(true);
        expect(viewState.playingEpisodeSlug).toBe('64');
        expect(viewState.isPlaying).toBe(true);
    });
});
