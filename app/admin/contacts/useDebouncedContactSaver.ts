'use client';

import type { ContactChanges } from '@/lib/contacts/Contact';
import { updateContact } from '@/lib/contacts/contactsApiClient';
import { useCallback, useEffect, useRef } from 'react';

/**
 * How long the typing in a note has to pause before the change is sent to the server
 */
const CONTACT_SAVE_DEBOUNCE_MILLISECONDS = 600;

type DebouncedContactSaver = {
    readonly saveContactChanges: (contactId: number, contactChanges: ContactChanges) => void;
    readonly takePendingContactChanges: (contactId: number) => ContactChanges | null;
};

/**
 * Save the changes of a contact to the server, but not more often than once per `CONTACT_SAVE_DEBOUNCE_MILLISECONDS`
 *
 * Note: Changes made in the meantime are merged together, so no change of any field is ever lost
 */
export function useDebouncedContactSaver(onSaveError: (errorMessage: string) => void): DebouncedContactSaver {
    const pendingChangesRef = useRef(new Map<number, ContactChanges>());
    const pendingTimeoutsRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    useEffect(() => {
        const pendingChanges = pendingChangesRef.current;
        const pendingTimeouts = pendingTimeoutsRef.current;

        return () => {
            pendingTimeouts.forEach((pendingTimeout) => clearTimeout(pendingTimeout));
            pendingTimeouts.clear();
            pendingChanges.clear();
        };
    }, []);

    const saveContactChanges = useCallback(
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

                    updateContact(contactId, changesToSave).catch((error: Error) => onSaveError(error.message));
                }, CONTACT_SAVE_DEBOUNCE_MILLISECONDS),
            );
        },
        [onSaveError],
    );

    /**
     * Stop the delayed save of one contact and hand its unsaved changes over to the caller
     *
     * Note: The caller decides what happens to them, it either saves them together with its own changes or drops them
     */
    const takePendingContactChanges = useCallback((contactId: number): ContactChanges | null => {
        const pendingTimeout = pendingTimeoutsRef.current.get(contactId);
        if (pendingTimeout !== undefined) {
            clearTimeout(pendingTimeout);
        }

        pendingTimeoutsRef.current.delete(contactId);

        const pendingChanges = pendingChangesRef.current.get(contactId) ?? null;
        pendingChangesRef.current.delete(contactId);

        return pendingChanges;
    }, []);

    return { saveContactChanges, takePendingContactChanges };
}
