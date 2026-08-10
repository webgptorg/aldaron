'use client';

import type { Contact, ContactChanges, ContactDraft } from '@/lib/contacts/Contact';
import { createContact, fetchContacts } from '@/lib/contacts/contactsApiClient';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedContactSaver } from './useDebouncedContactSaver';

type UseContactsResult = {
    readonly contacts: readonly Contact[];
    readonly isLoading: boolean;
    readonly errorMessage: string | null;
    readonly changeContact: (contactId: number, contactChanges: ContactChanges) => void;
    readonly addContact: (contactDraft: ContactDraft) => Promise<boolean>;
};

/**
 * Load every contact and keep it in sync with the changes made in the dashboard
 *
 * Note: A change is shown immediately and saved a moment later, so that typing a note is not sent letter by letter
 */
export function useContacts(adminToken: string | null): UseContactsResult {
    const [contacts, setContacts] = useState<readonly Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const saveContactChanges = useDebouncedContactSaver(adminToken, setErrorMessage);

    useEffect(() => {
        let isLoadingActive = true;
        setIsLoading(true);

        fetchContacts(adminToken)
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
                const addedContact = await createContact(adminToken, contactDraft);
                setContacts((previousContacts) => [addedContact, ...previousContacts]);
                setErrorMessage(null);
                return true;
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [adminToken],
    );

    return { contacts, isLoading, errorMessage, changeContact, addContact };
}
