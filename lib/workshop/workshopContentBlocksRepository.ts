import { WORKSHOP_CONTENT_BLOCK_TABLE_NAME } from '@/lib/workshop/workshopConfig';
import { createWorkshopApiError } from '@/lib/workshop/workshopApiError';
import { assertQuerySucceeded, getWorkshopDatabase } from '@/lib/workshop/workshopDatabase';
import type {
    WorkshopContentBlock,
    WorkshopContentBlockChanges,
    WorkshopContentBlockDraft,
} from '@/lib/workshop/workshopTypes';

/**
 * Every content block of the workshop, the drafts and the locked ones included
 *
 * Note: Only the administration is ever allowed to see this, the participants get the answer of
 *       `selectUnlockedContentBlocks`.
 */
export async function fetchAllContentBlocks(workshopId: string): Promise<readonly WorkshopContentBlock[]> {
    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_CONTENT_BLOCK_TABLE_NAME)
        .select('*')
        .eq('workshopId', workshopId)
        .order('sortOrder', { ascending: true })
        .order('id', { ascending: true });

    assertQuerySucceeded(error);

    return (data || []) as readonly WorkshopContentBlock[];
}

/**
 * Add one content block
 */
export async function createContentBlock(
    workshopId: string,
    contentBlockDraft: WorkshopContentBlockDraft,
): Promise<WorkshopContentBlock> {
    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_CONTENT_BLOCK_TABLE_NAME)
        .insert({ ...contentBlockDraft, workshopId })
        .select()
        .single();

    assertQuerySucceeded(error);

    return data as WorkshopContentBlock;
}

/**
 * Change the fields of one content block which were really sent
 *
 * Note: Changing the moment of the unlocking is what reveals or hides the block for everybody who is connected, no
 *       later than with the next poll of their page.
 */
export async function updateContentBlock(
    contentBlockId: number,
    contentBlockChanges: WorkshopContentBlockChanges,
): Promise<WorkshopContentBlock> {
    if (Object.keys(contentBlockChanges).length === 0) {
        throw createWorkshopApiError('There is nothing to change on the content block', 400);
    }

    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_CONTENT_BLOCK_TABLE_NAME)
        .update(contentBlockChanges)
        .eq('id', contentBlockId)
        .select()
        .single();

    assertQuerySucceeded(error);

    return data as WorkshopContentBlock;
}

/**
 * Remove one content block, which takes it away from everybody who is connected
 */
export async function deleteContentBlock(contentBlockId: number): Promise<void> {
    const { error } = await getWorkshopDatabase()
        .from(WORKSHOP_CONTENT_BLOCK_TABLE_NAME)
        .delete()
        .eq('id', contentBlockId);

    assertQuerySucceeded(error);
}
