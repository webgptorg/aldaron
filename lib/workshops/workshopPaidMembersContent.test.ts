import { selectWorkshopContentForMember } from '@/lib/workshops/workshopPaidMembersContent';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createContentBlock(contentBlock: Partial<WorkshopContentBlock>): WorkshopContentBlock {
    return {
        id: 'material-1',
        title: 'Podklady',
        bodyMarkdown: '[Materiál](https://ptbk.io/material-abc123)',
        unlockAt: '2026-08-20T19:00:00.000Z',
        sortOrder: 0,
        isPublished: true,
        isFollowUp: false,
        isPaidMembersOnly: false,
        createdAt: '2026-08-20T18:00:00.000Z',
        updatedAt: '2026-08-20T18:00:00.000Z',
        linkClickCount: 0,
        ...contentBlock,
    };
}

const FREE_CONTENT_BLOCK = createContentBlock({ id: 'material-free', title: 'Podklady z workshopu' });
const PAID_CONTENT_BLOCK = createContentBlock({
    id: 'material-paid',
    title: 'Bonusové podklady',
    isPaidMembersOnly: true,
});

describe('the materials one member of a room is given', () => {
    it('hands a paid member every material and names none of them as locked', () => {
        const selection = selectWorkshopContentForMember([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK], {
            isPaidMember: true,
            isMembershipOffered: true,
        });

        expect(selection.readableContentBlocks).toEqual([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK]);
        expect(selection.paidMembersOnlyContentPreviews).toEqual([]);
    });

    it('withholds a paid material from everybody else while naming it as a teaser', () => {
        const selection = selectWorkshopContentForMember([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK], {
            isPaidMember: false,
            isMembershipOffered: true,
        });

        expect(selection.readableContentBlocks).toEqual([FREE_CONTENT_BLOCK]);
        expect(selection.paidMembersOnlyContentPreviews).toEqual([
            { id: 'material-paid', title: 'Bonusové podklady' },
        ]);
    });

    it('lets nothing of a withheld material but its title leave the room', () => {
        const { paidMembersOnlyContentPreviews } = selectWorkshopContentForMember([PAID_CONTENT_BLOCK], {
            isPaidMember: false,
            isMembershipOffered: true,
        });

        expect(Object.keys(paidMembersOnlyContentPreviews[0] ?? {}).sort()).toEqual(['id', 'title']);
    });

    it('hides a paid material without naming it in a room which offers no membership at all', () => {
        const selection = selectWorkshopContentForMember([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK], {
            isPaidMember: false,
            isMembershipOffered: false,
        });

        expect(selection.readableContentBlocks).toEqual([FREE_CONTENT_BLOCK]);
        expect(selection.paidMembersOnlyContentPreviews).toEqual([]);
    });

    it('keeps the order the materials were read in', () => {
        const secondPaidContentBlock = createContentBlock({
            id: 'material-paid-2',
            title: 'Nahrávka workshopu',
            isPaidMembersOnly: true,
        });
        const { paidMembersOnlyContentPreviews } = selectWorkshopContentForMember(
            [PAID_CONTENT_BLOCK, FREE_CONTENT_BLOCK, secondPaidContentBlock],
            { isPaidMember: false, isMembershipOffered: true },
        );

        expect(paidMembersOnlyContentPreviews.map(({ title }) => title)).toEqual([
            'Bonusové podklady',
            'Nahrávka workshopu',
        ]);
    });
});
