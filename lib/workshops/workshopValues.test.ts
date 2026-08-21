import {
    createWorkshopCommentUpdateDatabaseValues,
    createWorkshopUpdateDatabaseValues,
    getWorkshopCommentPinChange,
} from '@/lib/workshops/workshopValues';
import { describe, expect, it } from 'vitest';

describe('workshop admin comment values', () => {
    it('approves a message together with pinning it, so the whole room reads what holds the top', () => {
        expect(createWorkshopCommentUpdateDatabaseValues({ isPinned: true })).toMatchObject({ status: 'approved' });
        expect(createWorkshopCommentUpdateDatabaseValues({ isPinned: true, status: 'approved' })).toMatchObject({
            status: 'approved',
        });
    });

    it('changes nothing about a message which is only released from the top of the chat', () => {
        expect(createWorkshopCommentUpdateDatabaseValues({ isPinned: false })).toEqual({});
    });

    it('leaves the moderation timestamp alone when nothing but the text is corrected', () => {
        expect(createWorkshopCommentUpdateDatabaseValues({ body: 'Opraveno.' })).toEqual({ body: 'Opraveno.' });
    });

    it('releases the top of the chat from a rejected message and leaves the pin alone otherwise', () => {
        expect(getWorkshopCommentPinChange({ status: 'rejected' })).toBe(false);
        expect(getWorkshopCommentPinChange({ isPinned: true })).toBe(true);
        expect(getWorkshopCommentPinChange({ isPinned: false })).toBe(false);
        expect(getWorkshopCommentPinChange({ status: 'approved' })).toBeNull();
        expect(getWorkshopCommentPinChange({ body: 'Opraveno.' })).toBeNull();
    });
});

describe('workshop admin values', () => {
    it('writes a changed URL slug to the workshop row', () => {
        expect(createWorkshopUpdateDatabaseValues({ slug: 'production-ai-september-2026' })).toEqual({
            slug: 'production-ai-september-2026',
        });
    });
});
