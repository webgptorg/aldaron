import {
    AI_SUPERVIZE_MINI_EVENT_TYPE,
    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
} from '@/businesses/ai-supervize-mini/config';
import {
    createAiSupervizeMiniWorkshopAvailabilityFromRegistrationContacts,
    type AiSupervizeMiniWorkshopAvailability,
    type AiSupervizeMiniWorkshopRegistrationContact,
} from '@/businesses/ai-supervize-mini/workshopRegistration';
import { getContactsTableOrNull, type ContactsTable } from '@/lib/contacts/contactsDatabase';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { loadUpcomingPublishedEventSummaries } from '@/lib/workshops/workshopPublic';

export type AiSupervizeMiniWorkshopAvailabilityLoadResult = {
    readonly workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[] | null;
    readonly errorMessage: string | null;
};

/**
 * Every term of this workshop a visitor can still register for, as the administration published them
 */
export async function loadAiSupervizeMiniEvents(): Promise<readonly EventOccurrence[]> {
    return loadUpcomingPublishedEventSummaries(AI_SUPERVIZE_MINI_EVENT_TYPE);
}

/**
 * Read only the contact field needed to calculate capacity. Personal contact
 * details never leave the server while someone is looking at the public page.
 */
export async function loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable(
    contactsTable: ContactsTable,
    events: readonly EventOccurrence[],
): Promise<AiSupervizeMiniWorkshopAvailabilityLoadResult> {
    const { data, error } = await contactsTable
        .select('userNote, isWaitlisted')
        .eq('placeName', AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME);

    if (error !== null) {
        return { workshopAvailabilities: null, errorMessage: error.message };
    }

    return {
        workshopAvailabilities: createAiSupervizeMiniWorkshopAvailabilityFromRegistrationContacts(
            events,
            (data ?? []) as AiSupervizeMiniWorkshopRegistrationContact[],
        ),
        errorMessage: null,
    };
}

/**
 * Availability for rendering the public landing page. A missing service role
 * key deliberately yields no made-up capacity value.
 */
export async function loadAiSupervizeMiniWorkshopAvailability(
    events: readonly EventOccurrence[],
): Promise<readonly AiSupervizeMiniWorkshopAvailability[] | null> {
    const contactsTable = getContactsTableOrNull();

    if (contactsTable === null) {
        return null;
    }

    const { workshopAvailabilities, errorMessage } = await loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable(
        contactsTable,
        events,
    );

    if (errorMessage !== null) {
        console.error('Failed to load AI Supervize Mini workshop availability:', errorMessage);
    }

    return workshopAvailabilities;
}
