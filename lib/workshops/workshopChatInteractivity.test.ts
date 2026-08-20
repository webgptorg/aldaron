import { getWorkshopChatInteractivity } from '@/lib/workshops/workshopChatInteractivity';
import { describe, expect, it } from 'vitest';

describe('workshop chat interactivity', () => {
    it('offers writing and voting in a chat which belongs to the participants', () => {
        expect(getWorkshopChatInteractivity({ isChatEnabled: true, isInteractionBanned: false })).toEqual({
            isWritingOffered: true,
            isUpvotingOffered: true,
        });
    });

    it('leaves the form to a banned participant, so nothing tells them about their ban', () => {
        expect(getWorkshopChatInteractivity({ isChatEnabled: true, isInteractionBanned: true })).toEqual({
            isWritingOffered: true,
            isUpvotingOffered: false,
        });
    });

    it('takes writing and voting from the whole room once the chat is switched off', () => {
        expect(getWorkshopChatInteractivity({ isChatEnabled: false, isInteractionBanned: false })).toEqual({
            isWritingOffered: false,
            isUpvotingOffered: false,
        });
        expect(getWorkshopChatInteractivity({ isChatEnabled: false, isInteractionBanned: true })).toEqual({
            isWritingOffered: false,
            isUpvotingOffered: false,
        });
    });
});
