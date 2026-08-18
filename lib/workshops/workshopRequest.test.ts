import {
    getWorkshopCommentStatusForParticipant,
    getWorkshopInteractionBanResponseOrNull,
} from '@/lib/workshops/workshopParticipantInteraction';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createParticipant(isInteractionBanned: boolean, isTrusted = false): WorkshopParticipant {
    return {
        id: 'participant-1',
        fullname: 'Jana Nováková',
        connectedAt: '2026-08-20T17:00:00.000Z',
        isInteractionBanned,
        isTrusted,
    };
}

describe('workshop participant interaction bans', () => {
    it('allows watching participants and refuses chat interactions for banned participants', async () => {
        expect(getWorkshopInteractionBanResponseOrNull(createParticipant(false))).toBeNull();

        const banResponse = getWorkshopInteractionBanResponseOrNull(createParticipant(true));

        expect(banResponse?.status).toBe(403);
        expect(await banResponse!.json()).toEqual({ error: 'Interakce nejsou pro tento účet dostupné.' });
    });

    it('uses trust for automatic approval while interaction bans always reject comments', () => {
        expect(getWorkshopCommentStatusForParticipant(createParticipant(false))).toBe('pending');
        expect(getWorkshopCommentStatusForParticipant(createParticipant(false, true))).toBe('approved');
        expect(getWorkshopCommentStatusForParticipant(createParticipant(true, true))).toBe('rejected');
    });
});
