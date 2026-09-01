'use client';

import { fetchAiTaKrajtaTranscriptMatchingEpisodeSlugs } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeSearchApi';
import { useEffect, useState } from 'react';

/**
 * How long typing waits before it starts a new server search, so one word does not make one request per letter
 */
const TRANSCRIPT_SEARCH_DEBOUNCE_MILLISECONDS = 250;

type AiTaKrajtaEpisodeTranscriptSearchResult = {
    readonly searchQuery: string;
    readonly episodeSlugs: readonly string[];
};

const EMPTY_AI_TA_KRAJTA_EPISODE_TRANSCRIPT_SEARCH_RESULT: AiTaKrajtaEpisodeTranscriptSearchResult = {
    searchQuery: '',
    episodeSlugs: [],
};

/**
 * Searches the server-only transcripts while the archive itself remains in the browser
 */
export function useAiTaKrajtaEpisodeTranscriptSearch(searchQuery: string): {
    readonly transcriptMatchingEpisodeSlugs: readonly string[];
    readonly isTranscriptSearchPending: boolean;
} {
    const [searchResult, setSearchResult] = useState<AiTaKrajtaEpisodeTranscriptSearchResult>(
        EMPTY_AI_TA_KRAJTA_EPISODE_TRANSCRIPT_SEARCH_RESULT,
    );
    const isSearchQueryPresent = searchQuery.trim() !== '';

    useEffect(() => {
        if (!isSearchQueryPresent) {
            setSearchResult(EMPTY_AI_TA_KRAJTA_EPISODE_TRANSCRIPT_SEARCH_RESULT);
            return;
        }

        const abortController = new AbortController();
        let isSearchCancelled = false;
        const searchTimeout = window.setTimeout(() => {
            void fetchAiTaKrajtaTranscriptMatchingEpisodeSlugs(searchQuery, abortController.signal)
                .then((episodeSlugs) => {
                    if (!isSearchCancelled) {
                        setSearchResult({ searchQuery, episodeSlugs });
                    }
                })
                .catch(() => {
                    if (!isSearchCancelled) {
                        // The visible card text still searches locally when the server cannot be reached.
                        setSearchResult({ searchQuery, episodeSlugs: [] });
                    }
                });
        }, TRANSCRIPT_SEARCH_DEBOUNCE_MILLISECONDS);

        return () => {
            isSearchCancelled = true;
            window.clearTimeout(searchTimeout);
            abortController.abort();
        };
    }, [isSearchQueryPresent, searchQuery]);

    const isTranscriptSearchPending = isSearchQueryPresent && searchResult.searchQuery !== searchQuery;

    return {
        transcriptMatchingEpisodeSlugs:
            isTranscriptSearchPending || !isSearchQueryPresent ? [] : searchResult.episodeSlugs,
        isTranscriptSearchPending,
    };
}
