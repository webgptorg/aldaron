import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';

/**
 * What decides whether the materials reserved for paid members reach the member reading the room
 */
export type WorkshopMemberContentAccess = {
    /**
     * Whether the member reading the room pays for the community membership
     */
    readonly isPaidMember: boolean;

    /**
     * Whether this kind of room offers the membership at all, see `workshopKindCapabilities`
     */
    readonly isMembershipOffered: boolean;
};

/**
 * The materials of a room as one member is given them: the ones they may read, and the ones they are merely told about
 */
export type WorkshopMemberContentSelection = {
    readonly readableContentBlocks: readonly WorkshopContentBlock[];
    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];
};

function toWorkshopContentPreview(contentBlock: WorkshopContentBlock): WorkshopContentPreview {
    return { id: contentBlock.id, title: contentBlock.title };
}

/**
 * Divides the materials a paid member would read into the ones this member receives and the ones which are only named
 * to them.
 *
 * Note: One list decides both, so what a room hides and what it says is waiting behind the membership can never
 *       disagree. A material is withheld with everything but its title, which is the teaser the room shows instead.
 * Note: A room which offers no membership has nothing a purchase could unlock, so it keeps such a material hidden
 *       without naming it.
 */
export function selectWorkshopContentForMember(
    contentBlocks: readonly WorkshopContentBlock[],
    { isPaidMember, isMembershipOffered }: WorkshopMemberContentAccess,
): WorkshopMemberContentSelection {
    if (isPaidMember) {
        return { readableContentBlocks: contentBlocks, paidMembersOnlyContentPreviews: [] };
    }

    return {
        readableContentBlocks: contentBlocks.filter((contentBlock) => !contentBlock.isPaidMembersOnly),
        paidMembersOnlyContentPreviews: !isMembershipOffered
            ? []
            : contentBlocks.filter((contentBlock) => contentBlock.isPaidMembersOnly).map(toWorkshopContentPreview),
    };
}
