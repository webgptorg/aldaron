'use client';

import { MAXIMAL_PARTICIPANT_NAME_LENGTH } from '@/lib/workshop/workshopConfig';
import type { WorkshopParticipantIdentity } from '@/lib/workshop/workshopTypes';
import { useCallback, useEffect, useState } from 'react';

/**
 * Keys under which the participant survives a reload of the page
 *
 * Note: A participant who reloads the page in the middle of the workshop must not be asked for the name again.
 */
const PARTICIPANT_NAME_STORAGE_KEY = 'workshop-participant-name';
const PARTICIPANT_ID_STORAGE_KEY = 'workshop-participant-id';

type UseParticipantIdentityResult = {
    /**
     * Who is watching, or `null` while nobody filled the name in yet
     */
    readonly participantIdentity: WorkshopParticipantIdentity | null;

    /**
     * Whether the browser storage was already read, which the server rendering cannot do
     */
    readonly isIdentityLoaded: boolean;

    readonly joinAsParticipant: (participantName: string) => void;
    readonly leaveWorkshop: () => void;
};

/**
 * Remember who is watching the workshop
 *
 * Note: Nobody signs in anywhere - the name is only what the others see in the chat, and the identifier is what tells
 *       the own messages from the ones of the others.
 */
export function useParticipantIdentity(): UseParticipantIdentityResult {
    const [participantIdentity, setParticipantIdentity] = useState<WorkshopParticipantIdentity | null>(null);
    const [isIdentityLoaded, setIsIdentityLoaded] = useState(false);

    useEffect(() => {
        const participantName = readFromStorage(PARTICIPANT_NAME_STORAGE_KEY);
        const participantId = readFromStorage(PARTICIPANT_ID_STORAGE_KEY);

        if (participantName !== null && participantId !== null) {
            setParticipantIdentity({ participantName, participantId });
        }

        setIsIdentityLoaded(true);
    }, []);

    const joinAsParticipant = useCallback((participantName: string) => {
        const trimmedParticipantName = participantName.trim().slice(0, MAXIMAL_PARTICIPANT_NAME_LENGTH);

        if (trimmedParticipantName === '') {
            return;
        }

        const participantId = readFromStorage(PARTICIPANT_ID_STORAGE_KEY) || createParticipantId();

        writeToStorage(PARTICIPANT_NAME_STORAGE_KEY, trimmedParticipantName);
        writeToStorage(PARTICIPANT_ID_STORAGE_KEY, participantId);

        setParticipantIdentity({ participantName: trimmedParticipantName, participantId });
    }, []);

    const leaveWorkshop = useCallback(() => {
        writeToStorage(PARTICIPANT_NAME_STORAGE_KEY, null);
        setParticipantIdentity(null);
    }, []);

    return { participantIdentity, isIdentityLoaded, joinAsParticipant, leaveWorkshop };
}

/**
 * Identifier of this browser among the other participants
 *
 * Note: It says nothing about the person, it only has to be different from the identifier of everybody else.
 */
function createParticipantId(): string {
    return `participant-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/**
 * Read one value from the browser storage, `null` when it is not there or the storage is refused
 */
function readFromStorage(storageKey: string): string | null {
    try {
        return localStorage.getItem(storageKey)?.trim() || null;
    } catch (error) {
        console.warn(`Failed to read \`${storageKey}\` from the browser storage`, error);
        return null;
    }
}

/**
 * Write one value into the browser storage, or forget it when the value is `null`
 */
function writeToStorage(storageKey: string, value: string | null): void {
    try {
        if (value === null) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, value);
        }
    } catch (error) {
        console.warn(`Failed to write \`${storageKey}\` into the browser storage`, error);
    }
}
