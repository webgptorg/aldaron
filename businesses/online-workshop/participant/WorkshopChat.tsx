'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MAXIMAL_WORKSHOP_COMMENT_LENGTH } from '@/lib/workshops/workshopConstants';
import type { WorkshopComment, WorkshopCommentSort } from '@/lib/workshops/workshopTypes';
import { Clock3, MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopChatProps = {
    readonly comments: readonly WorkshopComment[];
    readonly commentSort: WorkshopCommentSort;
    readonly isInteractionBanned: boolean;
    readonly onChangeSort: (sort: WorkshopCommentSort) => void;
    readonly onSubmitComment: (body: string) => Promise<boolean>;
    readonly onUpvoteComment: (commentId: string) => Promise<void>;
};

const CZECH_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' });

export function WorkshopChat({
    comments,
    commentSort,
    isInteractionBanned,
    onChangeSort,
    onSubmitComment,
    onUpvoteComment,
}: WorkshopChatProps) {
    const [commentBody, setCommentBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [upvotingCommentIds, setUpvotingCommentIds] = useState<ReadonlySet<string>>(new Set());

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!commentBody.trim()) {
            return;
        }
        setIsSubmitting(true);
        const isSubmitted = await onSubmitComment(commentBody);
        if (isSubmitted) {
            setCommentBody('');
        }
        setIsSubmitting(false);
    };

    const handleUpvote = async (commentId: string) => {
        setUpvotingCommentIds((currentIds) => new Set(currentIds).add(commentId));
        try {
            await onUpvoteComment(commentId);
        } finally {
            setUpvotingCommentIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(commentId);
                return nextIds;
            });
        }
    };

    return (
        <aside className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1c26] shadow-2xl lg:sticky lg:top-5 lg:h-[calc(100dvh-6.5rem)] lg:min-h-0">
            <header className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-cyan-300" />
                    <h2 className="font-bold text-white">Živý chat</h2>
                </div>
                <div className="mt-3 flex rounded-lg bg-white/5 p-1 text-xs">
                    <button
                        type="button"
                        onClick={() => onChangeSort('recent')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition ${commentSort === 'recent' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Clock3 className="h-3.5 w-3.5" /> Nejnovější
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeSort('upvotes')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition ${commentSort === 'upvotes' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ThumbsUp className="h-3.5 w-3.5" /> Nejvíce hlasů
                    </button>
                </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {comments.length === 0 ? (
                    <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
                        <MessageCircle className="h-8 w-8 text-slate-700" />
                        <p className="mt-3 text-sm text-slate-500">
                            Schválené komentáře se objeví tady. Položte první otázku.
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isUpvoting = upvotingCommentIds.has(comment.id);
                        const isCommentApproved = comment.status === 'approved';
                        return (
                            <article
                                key={comment.id}
                                className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">{comment.authorName}</p>
                                        <time className="text-[11px] text-slate-600" dateTime={comment.createdAt}>
                                            {CZECH_TIME_FORMAT.format(new Date(comment.createdAt))}
                                        </time>
                                        {!isCommentApproved && (
                                            <p className="mt-1 text-[11px] font-medium text-amber-200/80">
                                                Váš komentář čeká na schválení.
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={
                                            !isCommentApproved ||
                                            isInteractionBanned ||
                                            comment.isUpvotedByParticipant ||
                                            isUpvoting
                                        }
                                        onClick={() => void handleUpvote(comment.id)}
                                        className={`inline-flex min-w-12 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${comment.isUpvotedByParticipant ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200' : 'border-white/10 text-slate-500 hover:border-cyan-300/30 hover:text-cyan-200'} disabled:cursor-default`}
                                        aria-label={`Hlasovat pro komentář od ${comment.authorName}`}
                                    >
                                        <ThumbsUp className="h-3 w-3" /> {comment.upvoteCount}
                                    </button>
                                </div>
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                    {comment.body}
                                </p>
                            </article>
                        );
                    })
                )}
            </div>

            {isInteractionBanned ? (
                <div className="border-t border-white/10 p-4 text-center text-sm leading-6 text-amber-200/80">
                    Moderátor vám zakázal komentovat a hlasovat.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
                    <Textarea
                        value={commentBody}
                        onChange={(event) => setCommentBody(event.target.value)}
                        placeholder="Napište otázku nebo komentář…"
                        maxLength={MAXIMAL_WORKSHOP_COMMENT_LENGTH}
                        className="min-h-24 resize-none border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-600 focus-visible:ring-cyan-300/50"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-600">Komentáře schvaluje moderátor.</p>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !commentBody.trim()}
                            className="rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                        >
                            <Send className="mr-1.5 h-3.5 w-3.5" /> {isSubmitting ? 'Odesílám…' : 'Odeslat'}
                        </Button>
                    </div>
                </form>
            )}
        </aside>
    );
}
