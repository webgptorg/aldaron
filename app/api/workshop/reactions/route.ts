import { readWorkshopIdFromRequest } from '@/lib/workshop/servedWorkshop';
import { createWorkshopApiErrorResponse } from '@/lib/workshop/workshopApiErrorResponse';
import { MAXIMAL_PARTICIPANT_NAME_LENGTH } from '@/lib/workshop/workshopConfig';
import { createReaction } from '@/lib/workshop/workshopReactionsRepository';
import { readReactionEmoji, readText } from '@/lib/workshop/workshopValidation';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Store one reaction sent by a participant
 *
 * Note: Only the offered reactions are accepted, so nothing else can be sent through this endpoint and end up on the
 *       screen of the others.
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;

        await createReaction(
            readWorkshopIdFromRequest(request),
            readText(body.participantId, MAXIMAL_PARTICIPANT_NAME_LENGTH),
            readReactionEmoji(body.reactionEmoji),
        );

        return NextResponse.json({ isSent: true });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}
