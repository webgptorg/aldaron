import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';

export type WorkshopParticipantIdentity = {
    readonly email: string;
    readonly fullname: string;
};

function readWorkshopParticipantValue(value: SearchParameterValue, maximalLength: number): string {
    return readFirstSearchParameter(value)?.trim().slice(0, maximalLength) ?? '';
}

/**
 * Reads participant details from URL search parameters using the same limits as the participant connection form.
 */
export function readWorkshopParticipantIdentity(
    email: SearchParameterValue,
    fullname: SearchParameterValue,
): WorkshopParticipantIdentity {
    return {
        email: readWorkshopParticipantValue(email, MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH),
        fullname: readWorkshopParticipantValue(fullname, MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH),
    };
}

/**
 * Creates the query parameters used to prefill a workshop participant connection form.
 *
 * Invalid or incomplete values do not produce a link. The participant room still validates its form server-side, but
 * a confirmation page should never advertise a link which cannot prefill a usable connection.
 */
export function createWorkshopParticipantSearchParameters(
    identity: WorkshopParticipantIdentity,
): URLSearchParams | null {
    const normalizedIdentity = readWorkshopParticipantIdentity(identity.email, identity.fullname);

    if (
        !normalizedIdentity.email ||
        !normalizedIdentity.fullname ||
        !isEmailAddressValid(normalizedIdentity.email)
    ) {
        return null;
    }

    return new URLSearchParams({
        email: normalizedIdentity.email,
        fullname: normalizedIdentity.fullname,
    });
}

/**
 * Creates a site-relative participant URL with prefilled connection details.
 */
export function createWorkshopParticipantLink(
    participantPath: string,
    identity: WorkshopParticipantIdentity,
): string | null {
    const searchParameters = createWorkshopParticipantSearchParameters(identity);
    return searchParameters === null ? null : `${participantPath}?${searchParameters.toString()}`;
}
