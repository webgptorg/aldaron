import {
    createWorkshopParticipantSearchParameters,
    type WorkshopParticipantIdentity,
} from '@/lib/workshops/workshopParticipantLink';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/**
 * A direct room link is useful only during the final day before a workshop, when a confirmation e-mail may not be
 * found before the event starts.
 */
export const WORKSHOP_DIRECT_PARTICIPANT_LINK_WINDOW_HOURS = 24;
const WORKSHOP_DIRECT_PARTICIPANT_LINK_WINDOW_MILLISECONDS =
    WORKSHOP_DIRECT_PARTICIPANT_LINK_WINDOW_HOURS * MILLISECONDS_PER_HOUR;

/**
 * Whether a registration happened strictly during the 24 hours before the workshop starts.
 */
export function isWorkshopRegistrationWithinDirectParticipantLinkWindow(
    startsAt: string,
    registrationAtMilliseconds = Date.now(),
): boolean {
    const workshopStartAtMilliseconds = Date.parse(startsAt);
    const millisecondsUntilWorkshopStart = workshopStartAtMilliseconds - registrationAtMilliseconds;

    return (
        Number.isFinite(workshopStartAtMilliseconds) &&
        Number.isFinite(registrationAtMilliseconds) &&
        millisecondsUntilWorkshopStart > 0 &&
        millisecondsUntilWorkshopStart < WORKSHOP_DIRECT_PARTICIPANT_LINK_WINDOW_MILLISECONDS
    );
}

type WorkshopRegistrationThankYouPathOptions = {
    readonly thankYouPath: string;
    readonly startsAt: string;
    readonly participantIdentity: WorkshopParticipantIdentity;
    readonly registrationAtMilliseconds?: number;
};

/**
 * Carries participant details to a registration confirmation page only when the direct-room-link window is open.
 */
export function createWorkshopRegistrationThankYouPath({
    thankYouPath,
    startsAt,
    participantIdentity,
    registrationAtMilliseconds,
}: WorkshopRegistrationThankYouPathOptions): string {
    if (!isWorkshopRegistrationWithinDirectParticipantLinkWindow(startsAt, registrationAtMilliseconds)) {
        return thankYouPath;
    }

    const searchParameters = createWorkshopParticipantSearchParameters(participantIdentity);
    return searchParameters === null ? thankYouPath : `${thankYouPath}?${searchParameters.toString()}`;
}
