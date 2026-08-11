import { selectUnlockedContentBlocks } from '@/lib/workshop/selectUnlockedContentBlocks';
import { summarizeReactions } from '@/lib/workshop/summarizeReactions';
import { fetchChatMessages } from '@/lib/workshop/workshopChatMessagesRepository';
import { fetchAllContentBlocks } from '@/lib/workshop/workshopContentBlocksRepository';
import { fetchRecentReactions } from '@/lib/workshop/workshopReactionsRepository';
import { fetchWorkshopSettings } from '@/lib/workshop/workshopSettingsRepository';
import type { WorkshopSettings, WorkshopState } from '@/lib/workshop/workshopTypes';

/**
 * Everything one participant may see at this very moment
 *
 * Note: The whole page of a participant is fed by this one answer, so an unlocked block, a new message and a fresh
 *       reaction all arrive together and the page needs a single request to stay current.
 */
export async function loadWorkshopState(workshopId: string, fallbackSettings: WorkshopSettings): Promise<WorkshopState> {
    const serverTime = new Date();

    const [settings, allContentBlocks, chatMessages, recentReactions] = await Promise.all([
        fetchWorkshopSettings(workshopId, fallbackSettings),
        fetchAllContentBlocks(workshopId),
        fetchChatMessages(workshopId, { isShowingHidden: false }),
        fetchRecentReactions(workshopId, serverTime),
    ]);

    return {
        serverTime: serverTime.toISOString(),
        settings,
        contentBlocks: selectUnlockedContentBlocks(allContentBlocks, serverTime),
        chatMessages,
        reactions: summarizeReactions(recentReactions, serverTime),
    };
}
