import { MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH } from '@/lib/workshops/workshopConstants';

/**
 * Cleans a participant name the same way it is stored, so that a form never validates something else than the server
 */
export function normalizeWorkshopParticipantFullname(fullname: string): string {
    return fullname.trim();
}

/**
 * The single rule for a participant name, shared by the connection form, the rename form and the API schemas
 */
export function isWorkshopParticipantFullnameValid(fullname: string): boolean {
    const normalizedFullname = normalizeWorkshopParticipantFullname(fullname);

    return normalizedFullname.length >= 1 && normalizedFullname.length <= MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH;
}
