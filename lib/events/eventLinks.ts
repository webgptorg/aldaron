import { getEventTypeDefinition } from '@/lib/events/eventTypes';
import { createWorkshopRoomLink, type WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * Where one term of an event leads a member who is already connected somewhere else
 *
 * Note: A kind of event with a live room leads into that room and carries the already verified identity there, so the
 *       room never asks for it again. A kind of event without a room leads to its landing page, where a visitor picks
 *       a term and registers for it, because there is nothing else to open.
 * Note: A room which is not a term of any event the application knows leads nowhere rather than into the room of a
 *       different kind of event.
 */
export function createEventLinkOrNull(
    workshop: WorkshopSummary,
    participantIdentity: WorkshopParticipantIdentity,
): string | null {
    if (workshop.event === null) {
        return null;
    }

    const { participantPath, landingPagePath } = getEventTypeDefinition(workshop.event.type);

    return participantPath === null
        ? landingPagePath
        : createWorkshopRoomLink(participantPath, participantIdentity, workshop.slug);
}
