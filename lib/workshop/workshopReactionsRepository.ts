import { REACTION_HISTORY_DURATION_MS, WORKSHOP_REACTION_TABLE_NAME } from '@/lib/workshop/workshopConfig';
import { assertQuerySucceeded, getWorkshopDatabase } from '@/lib/workshop/workshopDatabase';
import type { WorkshopReaction } from '@/lib/workshop/workshopTypes';

/**
 * The reactions sent recently enough to still be counted
 *
 * Note: The window keeps the query small however long the workshop page stays online.
 */
export async function fetchRecentReactions(workshopId: string, atTime: Date): Promise<readonly WorkshopReaction[]> {
    const countedSinceTime = new Date(atTime.getTime() - REACTION_HISTORY_DURATION_MS);

    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_REACTION_TABLE_NAME)
        .select('*')
        .eq('workshopId', workshopId)
        .gte('createdAt', countedSinceTime.toISOString());

    assertQuerySucceeded(error);

    return (data || []) as readonly WorkshopReaction[];
}

/**
 * Store one reaction sent by a participant
 */
export async function createReaction(
    workshopId: string,
    participantId: string,
    reactionEmoji: string,
): Promise<WorkshopReaction> {
    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_REACTION_TABLE_NAME)
        .insert({ workshopId, participantId: participantId || null, reactionEmoji })
        .select()
        .single();

    assertQuerySucceeded(error);

    return data as WorkshopReaction;
}
