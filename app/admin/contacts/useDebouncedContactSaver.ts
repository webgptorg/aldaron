'use client';

import type { ContactChanges } from '@/lib/contacts/Contact';
import { updateContact } from '@/lib/contacts/contactsApiClient';
import { useCallback, useEffect, useRef } from 'react';

/**
 * How long the typing in a note has to pause before the change is sent to the server
 */
const CONTACT_SAVE_DEBOUNCE_MILLISECONDS = 600;

/**
 * Save the changes of a contact to the server, but not more often than once per `CONTACT_SAVE_DEBOUNCE_MILLISECONDS`
 *
 * Note: Changes made in the meantime are merged together, so no change of any field is ever lost
 */
export function useDebouncedContactSaver(
    adminToken: string | null,
    onSaveError: (errorMessage: string) => void,
): (contactId: number, contactChanges: ContactChanges) => void {
    const pendingChangesRef = useRef(new Map<number, ContactChanges>());
    const pendingTimeoutsRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    useEffect(() => {
        const pendingTimeouts = pendingTimeoutsRef.current;

        return () => {
            pendingTimeouts.forEach((pendingTimeout) => clearTimeout(pendingTimeout));
            pendingTimeouts.clear();
        };
    }, []);

    return useCallback(
        (contactId: number, contactChanges: ContactChanges) => {
            const pendingChanges = pendingChangesRef.current;
            const pendingTimeouts = pendingTimeoutsRef.current;

            pendingChanges.set(contactId, { ...pendingChanges.get(contactId), ...contactChanges });

            const pendingTimeout = pendingTimeouts.get(contactId);
            if (pendingTimeout !== undefined) {
                clearTimeout(pendingTimeout);
            }

            pendingTimeouts.set(
                contactId,
                setTimeout(() => {
                    const changesToSave = pendingChanges.get(contactId);
                    pendingChanges.delete(contactId);
                    pendingTimeouts.delete(contactId);

                    if (changesToSave === undefined) {
                        return;
                    }

                    updateContact(adminToken, contactId, changesToSave).catch((error: Error) =>
                        onSaveError(error.message),
                    );
                }, CONTACT_SAVE_DEBOUNCE_MILLISECONDS),
            );
        },
        [adminToken, onSaveError],
    );
}
