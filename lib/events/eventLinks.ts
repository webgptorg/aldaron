import { getEventTypeDefinition } from '@/lib/events/eventTypes';
import { createWorkshopRoomLink, type WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * Nobody in particular, which is who a publicly published link is built for
 */
const ANONYMOUS_WORKSHOP_PARTICIPANT_IDENTITY: WorkshopParticipantIdentity = { email: '', fullname: '' };

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

/**
 * Where one term leads everybody, which is the same destination without the identity of any member
 *
 * Note: This is what a published calendar carries, because such a calendar is read by whoever subscribed to it and by
 *       every calendar application on the way. It never names the member it was downloaded by.
 */
export function createPublicEventLinkOrNull(workshop: WorkshopSummary): string | null {
    return createEventLinkOrNull(workshop, ANONYMOUS_WORKSHOP_PARTICIPANT_IDENTITY);
}
