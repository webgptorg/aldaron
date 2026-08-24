import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type {
    WorkshopCommentStatus,
    WorkshopParticipant,
    WorkshopProjectStatus,
    WorkshopSubmissionStatus,
} from '@/lib/workshops/workshopTypes';
import { NextResponse } from 'next/server';

/**
 * Note: A moderator writes into the room they moderate, so their own message never waits for the moderation they would
 *       do themselves.
 */
export function getWorkshopCommentStatusForParticipant(participant: WorkshopParticipant): WorkshopCommentStatus {
    return getWorkshopSubmissionStatusForParticipant(participant);
}

/**
 * Trusted participants and room moderators do not wait for a second person to approve their project, just as they do
 * not wait for their chat messages. Keeping this decision in one function prevents the two member submission paths
 * from drifting apart.
 */
export function getWorkshopProjectStatusForParticipant(participant: WorkshopParticipant): WorkshopProjectStatus {
    return getWorkshopSubmissionStatusForParticipant(participant);
}

/**
 * Decides the moderation status of any member-authored submission. Chat messages and gallery projects both delegate
 * here, so trusting or silencing a participant has exactly the same consequence in every current submission surface.
 */
export function getWorkshopSubmissionStatusForParticipant(participant: WorkshopParticipant): WorkshopSubmissionStatus {
    if (participant.isInteractionBanned) {
        return 'rejected';
    }

    return participant.isTrusted || participant.isModerator ? 'approved' : 'pending';
}

export function getWorkshopInteractionBanResponseOrNull(participant: WorkshopParticipant): NextResponse | null {
    return participant.isInteractionBanned
        ? NextResponse.json({ error: 'Interakce nejsou pro tento účet dostupné.' }, { status: 403 })
        : null;
}

/**
 * Refuses an action of a participant which the room does not offer anymore
 *
 * Note: The room already takes away a switched-off panel and one its kind never had, so this only rejects a stale or
 *       a forged request.
 * Note: Only participants are held back here. The administration writes through its own routes and therefore keeps
 *       reacting and moderating in a room whose panels are switched off.
 */
export function getDisabledWorkshopPanelResponseOrNull(
    workshopRow: WorkshopRow,
    panelKey: WorkshopPanelKey,
): NextResponse | null {
    return isWorkshopPanelOffered(workshopRow.room_kind, workshopRow.disabled_panels, panelKey)
        ? null
        : NextResponse.json({ error: 'Tato část workshopu je právě vypnutá.' }, { status: 403 });
}
