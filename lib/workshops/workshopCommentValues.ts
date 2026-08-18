import type { WorkshopComment, WorkshopCommentSort } from '@/lib/workshops/workshopTypes';

export function getDisplayedWorkshopCommentUpvoteCount(
    realUpvoteCount: number,
    artificialUpvoteCount: number,
): number {
    return Math.max(0, realUpvoteCount + artificialUpvoteCount);
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
