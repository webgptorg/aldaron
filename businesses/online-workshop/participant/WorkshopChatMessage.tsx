'use client';

import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import { cn } from '@/lib/utils';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { Pin, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

type WorkshopChatMessageProps = {
    readonly className?: string;
    readonly comment: WorkshopComment;
    readonly isInteractionBanned: boolean;
    readonly onUpvote: (commentId: string) => Promise<void>;
};

const CZECH_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' });

/**
 * A single message of the chat, whether it opened a thread or answered one
 */
export function WorkshopChatMessage({ className, comment, isInteractionBanned, onUpvote }: WorkshopChatMessageProps) {
    const [isUpvoting, setIsUpvoting] = useState(false);

    const handleUpvote = async () => {
        setIsUpvoting(true);
        try {
            await onUpvote(comment.id);
        } finally {
            setIsUpvoting(false);
        }
    };

    return (
        <article className={cn('min-w-0', className)}>
            {comment.isPinned && (
                <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-cyan-300/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
                    <Pin className="h-3 w-3" /> Připnuto
                </p>
            )}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-slate-100">{comment.authorName}</p>
                    <time className="text-[11px] text-slate-600" dateTime={comment.createdAt}>
                        {CZECH_TIME_FORMAT.format(new Date(comment.createdAt))}
                    </time>
                </div>
                <button
                    type="button"
                    disabled={
                        comment.status !== 'approved' ||
                        isInteractionBanned ||
                        comment.isUpvotedByParticipant ||
                        isUpvoting
                    }
                    onClick={() => void handleUpvote()}
                    className={`inline-flex min-w-12 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${comment.isUpvotedByParticipant ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200' : 'border-white/10 text-slate-500 hover:border-cyan-300/30 hover:text-cyan-200'} disabled:cursor-default`}
                    aria-label={`Hlasovat pro komentář od ${comment.authorName}`}
                >
                    <ThumbsUp className="h-3 w-3" /> {comment.upvoteCount}
                </button>
            </div>
            <WorkshopCommentMarkdown
                content={comment.body}
                className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300"
            />
        </article>
    );
}
