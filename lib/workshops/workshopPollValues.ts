import type { WorkshopPoll, WorkshopPollOption } from '@/lib/workshops/workshopTypes';

/**
 * The result total is derived from the same option counts the room renders, so a poll never has a separately stored
 * counter which could drift away from a changed vote.
 */
export function getWorkshopPollVoteCount(poll: Pick<WorkshopPoll, 'options'>): number {
    return poll.options.reduce((total, option) => total + option.voteCount, 0);
}

/**
 * A whole percentage remains easy to scan in a compact community card. There is no percentage at all without votes,
 * which avoids a division-by-zero special case leaking into each consumer.
 */
export function getWorkshopPollOptionVotePercentage(
    option: Pick<WorkshopPollOption, 'voteCount'>,
    totalVoteCount: number,
): number {
    return totalVoteCount === 0 ? 0 : Math.round((option.voteCount / totalVoteCount) * 100);
}
