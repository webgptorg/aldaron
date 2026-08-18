import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { NextResponse } from 'next/server';

export function getWorkshopInteractionBanResponseOrNull(participant: WorkshopParticipant): NextResponse | null {
    return participant.isInteractionBanned
        ? NextResponse.json(
              { error: 'Moderátor vám zakázal komentovat a reagovat.' },
              { status: 403 },
          )
        : null;
}
