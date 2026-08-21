'use client';

import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import type { ContactChanges, ContactDraft, ContactTextValues } from '@/lib/contacts/Contact';
import {
    createContact,
    deleteContact as deleteContactRequest,
    fetchContacts,
    updateContact,
} from '@/lib/contacts/contactsApiClient';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedContactSaver } from './useDebouncedContactSaver';

type UseContactsResult = {
    readonly contacts: readonly AdminJoinedContact[];
    readonly isLoading: boolean;
    readonly errorMessage: string | null;
    readonly changeContact: (contactId: number, contactChanges: ContactChanges) => void;
    readonly addContact: (contactDraft: ContactDraft) => Promise<boolean>;
    readonly editContact: (contactId: number, contactValues: ContactTextValues) => Promise<boolean>;
    readonly deleteContact: (contactId: number) => Promise<boolean>;
};

/**
 * Load every contact and keep it in sync with the changes made in the dashboard
 *
 * Note: A change is shown immediately and saved a moment later, so that typing a note is not sent letter by letter
 */
export function useContacts(adminToken: string | null): UseContactsResult {
    const [contacts, setContacts] = useState<readonly AdminJoinedContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { saveContactChanges, takePendingContactChanges } = useDebouncedContactSaver(adminToken, setErrorMessage);

    const reloadContacts = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            const loadedContacts = await fetchContacts(adminToken);
            setContacts(loadedContacts);
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [adminToken]);

    useEffect(() => {
        let isLoadingActive = true;

        void fetchContacts(adminToken)
            .then((loadedContacts) => {
                if (!isLoadingActive) {
                    return;
                }
                setContacts(loadedContacts);
                setErrorMessage(null);
            })
            .catch((error: Error) => {
                if (!isLoadingActive) {
                    return;
                }
                setContacts([]);
                setErrorMessage(error.message);
            })
            .finally(() => {
                if (isLoadingActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isLoadingActive = false;
        };
    }, [adminToken]);

    const changeContact = useCallback(
        (contactId: number, contactChanges: ContactChanges) => {
            setContacts((previousContacts) =>
                previousContacts.map((contact) =>
                    contact.id === contactId ? { ...contact, ...contactChanges } : contact,
                ),
            );

            saveContactChanges(contactId, contactChanges);
        },
        [saveContactChanges],
    );

    const addContact = useCallback(
        async (contactDraft: ContactDraft): Promise<boolean> => {
            try {
                await createContact(adminToken, contactDraft);
                return reloadContacts();
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [adminToken, reloadContacts],
    );

    const editContact = useCallback(
        async (contactId: number, contactValues: ContactTextValues): Promise<boolean> => {
            // The dialog holds the newest text of every field, a delayed change of the same contact must not undo it
            // afterwards, so it is saved together with the dialog instead of on its own.
            const pendingContactChanges = takePendingContactChanges(contactId);

            try {
                await updateContact(adminToken, contactId, {
                    ...pendingContactChanges,
                    ...contactValues,
                });
                return reloadContacts();
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [adminToken, reloadContacts, takePendingContactChanges],
    );

    const deleteContact = useCallback(
        async (contactId: number): Promise<boolean> => {
            // A delayed update must not run after the contact row was removed, so its changes are dropped.
            takePendingContactChanges(contactId);

            try {
                await deleteContactRequest(adminToken, contactId);
                return reloadContacts();
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [adminToken, reloadContacts, takePendingContactChanges],
    );

    return { contacts, isLoading, errorMessage, changeContact, addContact, editContact, deleteContact };
}
