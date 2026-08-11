import { isContentBlockUnlocked } from '@/lib/workshop/selectUnlockedContentBlocks';
import type { WorkshopContentBlock } from '@/lib/workshop/workshopTypes';

/**
 * What the administration says about one content block at first sight
 */
export type ContentBlockStatus = {
    readonly label: string;
    readonly badgeClassName: string;
};

/**
 * Whether the block is already out, still waiting for its moment, or not planned at all
 *
 * Note: It answers exactly what the participants see, because it asks the very same question the server asks when it
 *       decides what to send them.
 */
export function getContentBlockStatus(contentBlock: WorkshopContentBlock, atTime: Date): ContentBlockStatus {
    if (contentBlock.unlockedAt === null) {
        return { label: 'Draft, not planned', badgeClassName: 'bg-gray-100 text-gray-600' };
    }

    if (isContentBlockUnlocked(contentBlock, atTime)) {
        return { label: 'Visible to the participants', badgeClassName: 'bg-emerald-100 text-emerald-700' };
    }

    return {
        label: `Unlocks ${new Date(contentBlock.unlockedAt).toLocaleString()}`,
        badgeClassName: 'bg-amber-100 text-amber-700',
    };
}
