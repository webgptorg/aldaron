import type { WorkshopContentBlock } from '@/lib/workshop/workshopTypes';

/**
 * Whether the block is already revealed at the given moment
 *
 * Note: A block without `unlockedAt` is a draft which is never revealed on its own, it waits for the administration
 *       to give it a moment.
 */
export function isContentBlockUnlocked(contentBlock: WorkshopContentBlock, atTime: Date): boolean {
    if (contentBlock.unlockedAt === null) {
        return false;
    }

    const unlockedAtTime = new Date(contentBlock.unlockedAt).getTime();

    if (Number.isNaN(unlockedAtTime)) {
        return false;
    }

    return unlockedAtTime <= atTime.getTime();
}

/**
 * Keep only the blocks a participant may see at the given moment, in the order they are shown in
 *
 * Note: The filtering happens on the server, so a block which is not unlocked yet never reaches the browser and
 *       cannot be read from the network tab before its moment.
 */
export function selectUnlockedContentBlocks(
    contentBlocks: readonly WorkshopContentBlock[],
    atTime: Date,
): readonly WorkshopContentBlock[] {
    return contentBlocks
        .filter((contentBlock) => isContentBlockUnlocked(contentBlock, atTime))
        .sort(compareContentBlocks);
}

/**
 * Order of two blocks, by the position given by the administration and then by the moment they were unlocked
 */
export function compareContentBlocks(
    contentBlock: WorkshopContentBlock,
    otherContentBlock: WorkshopContentBlock,
): number {
    if (contentBlock.sortOrder !== otherContentBlock.sortOrder) {
        return contentBlock.sortOrder - otherContentBlock.sortOrder;
    }

    const unlockedAt = contentBlock.unlockedAt || '';
    const otherUnlockedAt = otherContentBlock.unlockedAt || '';

    if (unlockedAt !== otherUnlockedAt) {
        return unlockedAt < otherUnlockedAt ? -1 : 1;
    }

    return contentBlock.id - otherContentBlock.id;
}
