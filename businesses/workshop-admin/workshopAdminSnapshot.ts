import type { WorkshopAdminSnapshot, WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';

function preserveUnchangedWorkshop(
    currentWorkshop: WorkshopDetails,
    loadedWorkshop: WorkshopDetails,
): WorkshopDetails {
    return currentWorkshop.updatedAt === loadedWorkshop.updatedAt ? currentWorkshop : loadedWorkshop;
}

function preserveUnchangedContentBlocks(
    currentContentBlocks: readonly WorkshopContentBlock[],
    loadedContentBlocks: readonly WorkshopContentBlock[],
): readonly WorkshopContentBlock[] {
    const currentContentBlockById = new Map(currentContentBlocks.map((contentBlock) => [contentBlock.id, contentBlock]));

    return loadedContentBlocks.map((loadedContentBlock) => {
        const currentContentBlock = currentContentBlockById.get(loadedContentBlock.id);
        return currentContentBlock?.updatedAt === loadedContentBlock.updatedAt &&
            currentContentBlock.linkClickCount === loadedContentBlock.linkClickCount
            ? currentContentBlock
            : loadedContentBlock;
    });
}

export function mergeWorkshopAdminSnapshot(
    currentSnapshot: WorkshopAdminSnapshot | null,
    loadedSnapshot: WorkshopAdminSnapshot,
): WorkshopAdminSnapshot {
    if (currentSnapshot?.workshop.id !== loadedSnapshot.workshop.id) {
        return loadedSnapshot;
    }

    return {
        ...loadedSnapshot,
        workshop: preserveUnchangedWorkshop(currentSnapshot.workshop, loadedSnapshot.workshop),
        contentBlocks: preserveUnchangedContentBlocks(currentSnapshot.contentBlocks, loadedSnapshot.contentBlocks),
    };
}
