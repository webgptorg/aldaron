import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';

export const WORKSHOP_SEARCH_PARAMETER_NAME = 'workshop';

const SITE_RELATIVE_URL_ORIGIN = 'https://promptbook.invalid';

export type WorkshopParticipantIdentity = {
    readonly email: string;
    readonly fullname: string;
};

function createSiteRelativePath(url: URL): string {
    return `${url.pathname}${url.search}${url.hash}`;
}

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
 * Reads the occurrence selected by a public workshop URL. An empty parameter is equivalent to no selection, while a
 * non-empty unknown slug is intentionally left for the database resolver to reject instead of falling back to another
 * workshop.
 */
export function readWorkshopSlug(value: SearchParameterValue): string | null {
    const workshopSlug = readFirstSearchParameter(value)?.trim() ?? '';
    return workshopSlug === '' ? null : workshopSlug;
}

/**
 * Adds the stable workshop selection to a site-relative path, preserving any existing search parameters and adding
 * any supplied details after it.
 */
export function createWorkshopSelectionPath(
    path: string,
    workshopSlug: string,
    additionalSearchParameters?: URLSearchParams,
): string {
    const workshopUrl = new URL(path, SITE_RELATIVE_URL_ORIGIN);
    workshopUrl.searchParams.set(WORKSHOP_SEARCH_PARAMETER_NAME, workshopSlug);
    additionalSearchParameters?.forEach((value, name) => workshopUrl.searchParams.set(name, value));
    return createSiteRelativePath(workshopUrl);
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
    workshopSlug: string,
): string | null {
    const searchParameters = createWorkshopParticipantSearchParameters(identity);
    if (searchParameters === null) {
        return null;
    }

    return createWorkshopSelectionPath(participantPath, workshopSlug, searchParameters);
}
