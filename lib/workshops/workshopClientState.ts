import type {
    WorkshopComment,
    WorkshopCommentSort,
    WorkshopReaction,
    WorkshopRealtimeEvent,
} from '@/lib/workshops/workshopTypes';

export const MAXIMAL_BROWSER_TIMEOUT_MILLISECONDS = 2_147_000_000;
const CONTENT_UNLOCK_REFRESH_PADDING_MILLISECONDS = 250;

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null;
}

function isWorkshopReaction(value: unknown): value is WorkshopReaction {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.emoji === 'string' &&
        typeof value.createdAt === 'string'
    );
}

export function isWorkshopRealtimeEvent(value: unknown): value is WorkshopRealtimeEvent {
    if (!isObject(value) || typeof value.kind !== 'string') {
        return false;
    }

    if (value.kind === 'state-changed') {
        return true;
    }

    if (value.kind === 'reaction') {
        return isWorkshopReaction(value.reaction);
    }

    return (
        value.kind === 'upvote' &&
        typeof value.commentId === 'string' &&
        typeof value.upvoteCount === 'number' &&
        Number.isSafeInteger(value.upvoteCount) &&
        value.upvoteCount >= 0
    );
}

export function sortWorkshopComments(
    comments: readonly WorkshopComment[],
    commentSort: WorkshopCommentSort,
): readonly WorkshopComment[] {
    return [...comments].sort((firstComment, secondComment) => {
        if (commentSort === 'upvotes' && firstComment.upvoteCount !== secondComment.upvoteCount) {
            return secondComment.upvoteCount - firstComment.upvoteCount;
        }

        return Date.parse(secondComment.createdAt) - Date.parse(firstComment.createdAt);
    });
}

export function getContentUnlockRefreshDelay(
    unlockAt: string,
    serverTime: string,
    clientTimeMilliseconds: number,
): number {
    const serverClockOffsetMilliseconds = Date.parse(serverTime) - clientTimeMilliseconds;
    const unlockDelayMilliseconds =
        Date.parse(unlockAt) -
        (clientTimeMilliseconds + serverClockOffsetMilliseconds) +
        CONTENT_UNLOCK_REFRESH_PADDING_MILLISECONDS;

    return Math.min(MAXIMAL_BROWSER_TIMEOUT_MILLISECONDS, Math.max(0, unlockDelayMilliseconds));
}
