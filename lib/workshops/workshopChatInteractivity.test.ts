import { getWorkshopChatInteractivity } from '@/lib/workshops/workshopChatInteractivity';
import { describe, expect, it } from 'vitest';

describe('workshop chat interactivity', () => {
    it('offers writing and voting in a chat which belongs to the participants', () => {
        expect(
            getWorkshopChatInteractivity({ isChatEnabled: true, isInteractionBanned: false, isModerating: false }),
        ).toEqual({
            isWritingOffered: true,
            isUpvotingOffered: true,
            isModerationOffered: false,
        });
    });

    it('leaves the form to a banned participant, so nothing tells them about their ban', () => {
        expect(
            getWorkshopChatInteractivity({ isChatEnabled: true, isInteractionBanned: true, isModerating: false }),
        ).toEqual({
            isWritingOffered: true,
            isUpvotingOffered: false,
            isModerationOffered: false,
        });
    });

    it('takes writing and voting from the whole room once the chat is switched off', () => {
        expect(
            getWorkshopChatInteractivity({ isChatEnabled: false, isInteractionBanned: false, isModerating: false }),
        ).toEqual({
            isWritingOffered: false,
            isUpvotingOffered: false,
            isModerationOffered: false,
        });
        expect(
            getWorkshopChatInteractivity({ isChatEnabled: false, isInteractionBanned: true, isModerating: false }),
        ).toEqual({
            isWritingOffered: false,
            isUpvotingOffered: false,
            isModerationOffered: false,
        });
    });

    it('keeps a moderator moderating a chat which the participants of the room cannot write into', () => {
        expect(
            getWorkshopChatInteractivity({ isChatEnabled: false, isInteractionBanned: false, isModerating: true }),
        ).toEqual({
            isWritingOffered: false,
            isUpvotingOffered: false,
            isModerationOffered: true,
        });
    });
});
