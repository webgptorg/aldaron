import { RECENT_REACTION_DURATION_MS, WORKSHOP_REACTION_EMOJIS } from '@/lib/workshop/workshopConfig';
import type { WorkshopReaction, WorkshopReactionSummary } from '@/lib/workshop/workshopTypes';

/**
 * The offered reactions before anybody sent any
 *
 * Note: The row of buttons is drawn from this while the first answer of the server is still on its way, so the
 *       participant can react from the very first moment.
 */
export const EMPTY_REACTION_SUMMARIES: readonly WorkshopReactionSummary[] = WORKSHOP_REACTION_EMOJIS.map(
    (reactionEmoji) => ({ reactionEmoji, totalCount: 0, recentCount: 0 }),
);

/**
 * Count how many times each reaction was sent and how many of those are still fresh
 *
 * Note: The offered reactions are always all listed, even with a count of zero, so the row of buttons never jumps
 *       when the first one of a kind arrives.
 */
export function summarizeReactions(
    reactions: readonly WorkshopReaction[],
    atTime: Date,
): readonly WorkshopReactionSummary[] {
    const recentSinceTime = atTime.getTime() - RECENT_REACTION_DURATION_MS;

    return WORKSHOP_REACTION_EMOJIS.map((reactionEmoji) => {
        const sentReactions = reactions.filter((reaction) => reaction.reactionEmoji === reactionEmoji);

        return {
            reactionEmoji,
            totalCount: sentReactions.length,
            recentCount: sentReactions.filter((reaction) => isReactionRecent(reaction, recentSinceTime)).length,
        };
    });
}

/**
 * Whether the reaction was sent recently enough to still be worth showing as it flies over the stream
 */
function isReactionRecent(reaction: WorkshopReaction, recentSinceTime: number): boolean {
    if (reaction.createdAt === null) {
        return false;
    }

    const createdAtTime = new Date(reaction.createdAt).getTime();

    if (Number.isNaN(createdAtTime)) {
        return false;
    }

    return createdAtTime >= recentSinceTime;
}
