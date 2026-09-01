import {
    AI_TA_KRAJTA_EPISODE_SEARCH_API_PATH,
    AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME,
} from '@/businesses/ai-ta-krajta/config';

type AiTaKrajtaEpisodeTranscriptSearchResponse = {
    readonly episodeSlugs: readonly string[];
};

/**
 * Whether a server response has the deliberately small shape the browser may use to filter its local archive
 */
function isAiTaKrajtaEpisodeTranscriptSearchResponse(
    value: unknown,
): value is AiTaKrajtaEpisodeTranscriptSearchResponse {
    return (
        typeof value === 'object' &&
        value !== null &&
        'episodeSlugs' in value &&
        Array.isArray(value.episodeSlugs) &&
        value.episodeSlugs.every((episodeSlug) => typeof episodeSlug === 'string')
    );
}

/**
 * Asks the server which episode transcripts mention the requested words
 *
 * Note: The response is identifiers alone. Full transcripts are intentionally never a browser API response.
 */
export async function fetchAiTaKrajtaTranscriptMatchingEpisodeSlugs(
    searchQuery: string,
    abortSignal: AbortSignal,
): Promise<readonly string[]> {
    const searchParameters = new URLSearchParams({
        [AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME]: searchQuery,
    });
    const response = await fetch(`${AI_TA_KRAJTA_EPISODE_SEARCH_API_PATH}?${searchParameters.toString()}`, {
        signal: abortSignal,
    });

    if (!response.ok) {
        return [];
    }

    const responseBody: unknown = await response.json();

    return isAiTaKrajtaEpisodeTranscriptSearchResponse(responseBody) ? responseBody.episodeSlugs : [];
}
