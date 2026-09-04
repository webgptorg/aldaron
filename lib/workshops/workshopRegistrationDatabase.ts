import { getContactsTableOrNull } from '@/lib/contacts/contactsDatabase';
import { EVENT_REGISTRATION_PLACE_NAMES } from '@/lib/events/eventTypes';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { countRegisteredParticipantsByTermId, readWorkshopRegistration } from '@/lib/workshops/workshopRegistrations';

/**
 * The one column of a gathered contact which says which term it registered for and for how many people
 */
type WorkshopRegistrationNoteRow = {
    readonly userNote: string | null;
};

/**
 * Unique stable ordering tie-breaker, so a paged read never repeats or skips a registration
 */
const CONTACT_ID_COLUMN = 'id';

/**
 * Where a gathered contact says which public form it was left in
 */
const CONTACT_PLACE_NAME_COLUMN = 'placeName';

/**
 * How the people registered for every term are named in the server console when they cannot be counted
 */
const WORKSHOP_REGISTRATION_READ_NAME = 'the registrations gathered for the administered terms';

/**
 * Counts the people every term was registered for on the landing page of its event
 *
 * Note: Only the notes of the registration forms are read, so counting an audience never loads the name, the address
 *       or anything else of the people who registered. Who they are stays in `/admin/contacts`, which is the one place
 *       gathering and showing them.
 * Note: An unavailable count must never take the whole administration down with it, so a server which cannot reach the
 *       contacts, and a read the database refuses, are both reported as no counted registrations at all.
 */
export async function loadRegisteredParticipantCountsByTermId(): Promise<ReadonlyMap<string, number>> {
    const contactsTable = getContactsTableOrNull();

    if (contactsTable === null) {
        return new Map();
    }

    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopRegistrationNoteRow>(
        (fromIndex, toIndex) =>
            contactsTable
                .select('userNote')
                .in(CONTACT_PLACE_NAME_COLUMN, EVENT_REGISTRATION_PLACE_NAMES)
                .order(CONTACT_ID_COLUMN, { ascending: true })
                .range(fromIndex, toIndex),
        WORKSHOP_REGISTRATION_READ_NAME,
    );

    if (rows === null) {
        console.error('Failed to count the people registered for the administered terms:', errorMessage);
        return new Map();
    }

    return countRegisteredParticipantsByTermId(
        rows.map((registrationNoteRow) => readWorkshopRegistration(registrationNoteRow.userNote)),
    );
}
