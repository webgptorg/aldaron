'use client';

import { WorkshopChatComposer } from '@/businesses/online-workshop/participant/WorkshopChatComposer';
import { WorkshopChatMessage } from '@/businesses/online-workshop/participant/WorkshopChatMessage';
import type { WorkshopCommentValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import type { WorkshopCommentThread } from '@/lib/workshops/workshopTypes';
import { Reply } from 'lucide-react';
import { useState } from 'react';

type WorkshopChatThreadProps = {
    readonly thread: WorkshopCommentThread;
    readonly isInteractionBanned: boolean;
    readonly onSubmitComment: (values: WorkshopCommentValues) => Promise<boolean>;
    readonly onUpvoteComment: (commentId: string) => Promise<void>;
};

/**
 * One conversation of the chat, so a message together with the answers it received
 */
export function WorkshopChatThread({
    thread,
    isInteractionBanned,
    onSubmitComment,
    onUpvoteComment,
}: WorkshopChatThreadProps) {
    const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
    const { comment, replies } = thread;

    // Note: Only a message the whole room sees can be answered, and an answer is never answered again.
    const isReplyOffered = comment.status === 'approved' && comment.parentCommentId === null;

    const handleSubmitReply = async (body: string): Promise<boolean> => {
        const isSubmitted = await onSubmitComment({ body, parentCommentId: comment.id });
        if (isSubmitted) {
            setIsReplyFormOpen(false);
        }
        return isSubmitted;
    };

    return (
        <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">
            <WorkshopChatMessage
                comment={comment}
                isInteractionBanned={isInteractionBanned}
                onUpvote={onUpvoteComment}
            />

            {replies.length > 0 && (
                <div className="mt-4 space-y-4 border-l border-white/10 pl-4">
                    {replies.map((reply) => (
                        <WorkshopChatMessage
                            key={reply.id}
                            comment={reply}
                            isInteractionBanned={isInteractionBanned}
                            onUpvote={onUpvoteComment}
                        />
                    ))}
                </div>
            )}

            {isReplyOffered &&
                (isReplyFormOpen ? (
                    <WorkshopChatComposer
                        className="mt-4 border-l border-white/10 pl-4"
                        label={`Odpověď na komentář od ${comment.authorName}`}
                        placeholder="Napište odpověď…"
                        isCompact
                        isAutoFocused
                        onCancel={() => setIsReplyFormOpen(false)}
                        onSubmit={handleSubmitReply}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsReplyFormOpen(true)}
                        aria-label={`Odpovědět na komentář od ${comment.authorName}`}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-500 transition hover:border-cyan-300/30 hover:text-cyan-200"
                    >
                        <Reply className="h-3 w-3" /> Odpovědět
                    </button>
                ))}
        </div>
    );
}
