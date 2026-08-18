import type { WorkshopCommentStatus, WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { NextResponse } from 'next/server';

export function getWorkshopCommentStatusForParticipant(participant: WorkshopParticipant): WorkshopCommentStatus {
    if (participant.isInteractionBanned) {
        return 'rejected';
    }

    return participant.isTrusted ? 'approved' : 'pending';
}

export function getWorkshopInteractionBanResponseOrNull(participant: WorkshopParticipant): NextResponse | null {
    return participant.isInteractionBanned
        ? NextResponse.json(
              { error: 'Interakce nejsou pro tento účet dostupné.' },
              { status: 403 },
          )
        : null;
}
