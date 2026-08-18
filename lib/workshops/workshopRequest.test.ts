import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createParticipant(isInteractionBanned: boolean): WorkshopParticipant {
    return {
        id: 'participant-1',
        fullname: 'Jana Nováková',
        connectedAt: '2026-08-20T17:00:00.000Z',
        isInteractionBanned,
    };
}

describe('workshop participant interaction bans', () => {
    it('allows watching participants and refuses chat interactions for banned participants', async () => {
        expect(getWorkshopInteractionBanResponseOrNull(createParticipant(false))).toBeNull();

        const banResponse = getWorkshopInteractionBanResponseOrNull(createParticipant(true));

        expect(banResponse?.status).toBe(403);
        expect(await banResponse!.json()).toEqual({ error: 'Moderátor vám zakázal komentovat a reagovat.' });
    });
});
