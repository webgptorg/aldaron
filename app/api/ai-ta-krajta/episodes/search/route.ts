import { findAiTaKrajtaEpisodeSlugsMatchingTranscript } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeTranscriptSearch';
import {
    AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME,
    MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH,
} from '@/businesses/ai-ta-krajta/config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Looks up the archive transcripts and returns only the safe slugs of matching episodes
 */
export function GET(request: NextRequest) {
    const searchQuery = request.nextUrl.searchParams.get(AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME);

    if (searchQuery === null || searchQuery.length > MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH) {
        return NextResponse.json({ episodeSlugs: [] }, { status: 400 });
    }

    return NextResponse.json(
        { episodeSlugs: findAiTaKrajtaEpisodeSlugsMatchingTranscript(searchQuery) },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
