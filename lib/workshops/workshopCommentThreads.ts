import { sortWorkshopComments } from '@/lib/workshops/workshopCommentValues';
import type { WorkshopComment, WorkshopCommentSort, WorkshopCommentThread } from '@/lib/workshops/workshopTypes';

/**
 * Whether a comment opens its own thread instead of answering another one
 *
 * Note: A reply whose parent is missing opens its own thread as well. The parent may have been rejected, deleted, or
 *       pushed out of the visible window, and none of that is a reason to hide an approved message from the room.
 */
function isWorkshopCommentThreadRoot(comment: WorkshopComment, rootCommentIds: ReadonlySet<string>): boolean {
    return comment.parentCommentId === null || !rootCommentIds.has(comment.parentCommentId);
}

function getWorkshopCommentRepliesByParentId(
    comments: readonly WorkshopComment[],
    rootCommentIds: ReadonlySet<string>,
): ReadonlyMap<string, readonly WorkshopComment[]> {
    const repliesByParentId = new Map<string, WorkshopComment[]>();

    comments.forEach((comment) => {
        const { parentCommentId } = comment;
        if (parentCommentId === null || isWorkshopCommentThreadRoot(comment, rootCommentIds)) {
            return;
        }

        const parentReplies = repliesByParentId.get(parentCommentId);
        if (parentReplies === undefined) {
            repliesByParentId.set(parentCommentId, [comment]);
        } else {
            parentReplies.push(comment);
        }
    });

    return repliesByParentId;
}

/**
 * Orders the answers of a single thread the way it is read, from the oldest one down
 */
function sortWorkshopCommentRepliesChronologically(
    replies: readonly WorkshopComment[],
): readonly WorkshopComment[] {
    return [...replies].sort(
        (firstReply, secondReply) => Date.parse(firstReply.createdAt) - Date.parse(secondReply.createdAt),
    );
}

/**
 * Whether an admin pinned this conversation, so its opening message or one of its answers
 */
export function isWorkshopCommentThreadPinned(thread: WorkshopCommentThread): boolean {
    return thread.comment.isPinned || thread.replies.some((reply) => reply.isPinned);
}

/**
 * Lifts the pinned conversation above all the others without disturbing the order the room asked for
 */
function sortPinnedWorkshopCommentThreadsFirst(
    threads: readonly WorkshopCommentThread[],
): readonly WorkshopCommentThread[] {
    const pinnedThreads = threads.filter(isWorkshopCommentThreadPinned);
    if (pinnedThreads.length === 0) {
        return threads;
    }

    return [...pinnedThreads, ...threads.filter((thread) => !isWorkshopCommentThreadPinned(thread))];
}

function getWorkshopThreadActivityTime(thread: WorkshopCommentThread): number {
    return thread.replies.reduce(
        (latestActivityTime, reply) => Math.max(latestActivityTime, Date.parse(reply.createdAt)),
        Date.parse(thread.comment.createdAt),
    );
}

/**
 * Groups a flat list of comments into the threads the chat shows
 *
 * Note: Sorting by the newest first ranks a thread by its own newest message, so an answer to an older question lifts
 *       the whole conversation instead of hiding below the questions asked meanwhile. Sorting by upvotes keeps ranking
 *       the threads by the votes of the comment which opened them, so a vote is what decides the order the room asked
 *       for.
 * Note: A pinned conversation stays on top of both orders, because an admin pins a message exactly to keep it there.
 */
export function buildWorkshopCommentThreads(
    comments: readonly WorkshopComment[],
    commentSort: WorkshopCommentSort,
): readonly WorkshopCommentThread[] {
    const rootCommentIds = new Set(
        comments.filter((comment) => comment.parentCommentId === null).map((comment) => comment.id),
    );
    const repliesByParentId = getWorkshopCommentRepliesByParentId(comments, rootCommentIds);
    const threads = sortWorkshopComments(
        comments.filter((comment) => isWorkshopCommentThreadRoot(comment, rootCommentIds)),
        commentSort,
    ).map((comment) => ({
        comment,
        replies: sortWorkshopCommentRepliesChronologically(repliesByParentId.get(comment.id) ?? []),
    }));

    if (commentSort !== 'recent') {
        return sortPinnedWorkshopCommentThreadsFirst(threads);
    }

    return sortPinnedWorkshopCommentThreadsFirst(
        [...threads].sort(
            (firstThread, secondThread) =>
                getWorkshopThreadActivityTime(secondThread) - getWorkshopThreadActivityTime(firstThread),
        ),
    );
}
