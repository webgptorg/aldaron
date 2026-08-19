import { buildWorkshopCommentThreads } from '@/lib/workshops/workshopCommentThreads';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createComment(values: Partial<WorkshopComment> & { readonly id: string }): WorkshopComment {
    return {
        authorName: 'Jana Nováková',
        body: 'Zpráva do chatu',
        status: 'approved',
        upvoteCount: 0,
        isUpvotedByParticipant: false,
        createdAt: '2026-08-20T19:00:00.000Z',
        parentCommentId: null,
        ...values,
    };
}

const QUESTION = createComment({ id: 'question', createdAt: '2026-08-20T19:00:00.000Z', upvoteCount: 5 });
const OTHER_QUESTION = createComment({ id: 'other-question', createdAt: '2026-08-20T19:05:00.000Z', upvoteCount: 9 });
const EARLY_ANSWER = createComment({
    id: 'early-answer',
    parentCommentId: 'question',
    createdAt: '2026-08-20T19:10:00.000Z',
});
const LATE_ANSWER = createComment({
    id: 'late-answer',
    parentCommentId: 'question',
    createdAt: '2026-08-20T19:20:00.000Z',
});

function getThreadIds(comments: readonly WorkshopComment[], commentSort: 'recent' | 'upvotes'): readonly string[] {
    return buildWorkshopCommentThreads(comments, commentSort).map((thread) => thread.comment.id);
}

describe('workshop comment threads', () => {
    it('groups the answers below the comment they answer, from the oldest one down', () => {
        const threads = buildWorkshopCommentThreads([LATE_ANSWER, EARLY_ANSWER, QUESTION, OTHER_QUESTION], 'recent');

        expect(threads.map((thread) => thread.replies.map((reply) => reply.id))).toEqual([
            ['early-answer', 'late-answer'],
            [],
        ]);
    });

    it('lifts a conversation by its newest answer when the room sorts by the newest', () => {
        expect(getThreadIds([QUESTION, OTHER_QUESTION, EARLY_ANSWER, LATE_ANSWER], 'recent')).toEqual([
            'question',
            'other-question',
        ]);
        expect(getThreadIds([QUESTION, OTHER_QUESTION], 'recent')).toEqual(['other-question', 'question']);
    });

    it('keeps ranking the conversations by the votes of the comment which opened them', () => {
        expect(getThreadIds([QUESTION, OTHER_QUESTION, EARLY_ANSWER, LATE_ANSWER], 'upvotes')).toEqual([
            'other-question',
            'question',
        ]);
    });

    it('never hides an answer whose answered comment is not in the room anymore', () => {
        const orphanAnswer = createComment({
            id: 'orphan-answer',
            parentCommentId: 'moderated-away-question',
            createdAt: '2026-08-20T19:15:00.000Z',
        });

        expect(getThreadIds([QUESTION, OTHER_QUESTION, orphanAnswer], 'recent')).toEqual([
            'orphan-answer',
            'other-question',
            'question',
        ]);
    });

    it('shows a comment waiting for approval in the thread of its author', () => {
        const pendingAnswer = createComment({
            id: 'pending-answer',
            parentCommentId: 'question',
            status: 'pending',
            createdAt: '2026-08-20T19:30:00.000Z',
        });
        const threads = buildWorkshopCommentThreads([QUESTION, EARLY_ANSWER, pendingAnswer], 'recent');

        expect(threads).toHaveLength(1);
        expect(threads[0]?.replies.map((reply) => reply.id)).toEqual(['early-answer', 'pending-answer']);
    });
});
