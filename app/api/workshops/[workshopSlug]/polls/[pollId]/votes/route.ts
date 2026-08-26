import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    loadWorkshopPolls,
} from '@/lib/workshops/workshopDatabase';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { WORKSHOP_POLL_OPTION_TABLE_NAME, WORKSHOP_POLL_TABLE_NAME, WORKSHOP_POLL_VOTE_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopPollVoteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopPollVoteRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly pollId: string }>;
};

/**
 * Records one member's choice in a poll. The unique `(poll_id, participant_id)` key makes an option change an update
 * rather than a second secret vote, while the database trigger closes the race with an administrator ending a poll.
 */
export async function POST(request: NextRequest, context: WorkshopPollVoteRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollVoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Invalid poll option' }, { status: 400 });
    }

    const { workshopSlug, pollId } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (!getWorkshopKindCapabilities(authenticatedRequest.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    const { data: poll, error: pollError } = await authenticatedRequest.supabase
        .from(WORKSHOP_POLL_TABLE_NAME)
        .select('id, is_closed, is_visible')
        .eq('id', pollId)
        .eq('workshop_id', authenticatedRequest.workshopRow.id)
        .maybeSingle();
    if (pollError) {
        return NextResponse.json({ error: 'Poll could not be checked' }, { status: 500 });
    }
    if (poll === null || !poll.is_visible) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }
    if (poll.is_closed) {
        return NextResponse.json({ error: 'Poll has already ended' }, { status: 409 });
    }

    const { data: option, error: optionError } = await authenticatedRequest.supabase
        .from(WORKSHOP_POLL_OPTION_TABLE_NAME)
        .select('id')
        .eq('id', parsedResult.data.optionId)
        .eq('poll_id', pollId)
        .maybeSingle();
    if (optionError) {
        return NextResponse.json({ error: 'Poll option could not be checked' }, { status: 500 });
    }
    if (option === null) {
        return NextResponse.json({ error: 'Poll option not found' }, { status: 404 });
    }

    const { error: voteError } = await authenticatedRequest.supabase
        .from(WORKSHOP_POLL_VOTE_TABLE_NAME)
        .upsert(
            {
                workshop_id: authenticatedRequest.workshopRow.id,
                poll_id: pollId,
                option_id: parsedResult.data.optionId,
                participant_id: authenticatedRequest.participant.id,
            },
            { onConflict: 'poll_id,participant_id' },
        );
    if (voteError) {
        if (voteError.code === 'P0001' && voteError.message === 'WORKSHOP_POLL_CLOSED') {
            return NextResponse.json({ error: 'Poll has already ended' }, { status: 409 });
        }

        console.error('Failed to save a workshop poll vote:', voteError.message);
        return NextResponse.json({ error: 'Poll vote could not be saved' }, { status: 500 });
    }

    const { polls, errorMessage } = await loadWorkshopPolls(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant.id,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    const updatedPoll = polls.find((currentPoll) => currentPoll.id === pollId);
    if (updatedPoll === undefined) {
        return NextResponse.json({ error: 'Poll could not be loaded' }, { status: 500 });
    }

    await broadcastWorkshopEvent(authenticatedRequest.supabase, authenticatedRequest.workshopRow, {
        kind: 'state-changed',
    });
    return NextResponse.json({ poll: updatedPoll }, { headers: { 'Cache-Control': 'no-store' } });
}
