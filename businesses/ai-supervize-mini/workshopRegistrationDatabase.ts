import { AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME } from '@/businesses/ai-supervize-mini/config';
import {
    createAiSupervizeMiniWorkshopAvailability,
    type AiSupervizeMiniWorkshopAvailability,
} from '@/businesses/ai-supervize-mini/workshopRegistration';
import { getContactsTableOrNull, type ContactsTable } from '@/lib/contacts/contactsDatabase';

type WorkshopRegistrationContact = {
    readonly userNote: string | null;
};

export type AiSupervizeMiniWorkshopAvailabilityLoadResult = {
    readonly workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[] | null;
    readonly errorMessage: string | null;
};

/**
 * Read only the contact field needed to calculate capacity. Personal contact
 * details never leave the server while someone is looking at the public page.
 */
export async function loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable(
    contactsTable: ContactsTable,
): Promise<AiSupervizeMiniWorkshopAvailabilityLoadResult> {
    const { data, error } = await contactsTable
        .select('userNote')
        .eq('placeName', AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME);

    if (error !== null) {
        return { workshopAvailabilities: null, errorMessage: error.message };
    }

    const contactNotes = ((data ?? []) as WorkshopRegistrationContact[]).map((contact) => contact.userNote);

    return {
        workshopAvailabilities: createAiSupervizeMiniWorkshopAvailability(contactNotes),
        errorMessage: null,
    };
}

/**
 * Availability for rendering the public landing page. A missing service role
 * key deliberately yields no made-up capacity value.
 */
export async function loadAiSupervizeMiniWorkshopAvailability(): Promise<
    readonly AiSupervizeMiniWorkshopAvailability[] | null
> {
    const contactsTable = getContactsTableOrNull();

    if (contactsTable === null) {
        return null;
    }

    const { workshopAvailabilities, errorMessage } = await loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable(
        contactsTable,
    );

    if (errorMessage !== null) {
        console.error('Failed to load AI Supervize Mini workshop availability:', errorMessage);
    }

    return workshopAvailabilities;
}
