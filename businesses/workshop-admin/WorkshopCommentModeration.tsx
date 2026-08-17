'use client';

import { Button } from '@/components/ui/button';
import type { WorkshopAdminComment, WorkshopCommentStatus } from '@/lib/workshops/workshopTypes';
import { Check, Clock3, MessageCircle, ThumbsUp, X } from 'lucide-react';
import { useState } from 'react';

type WorkshopCommentModerationProps = {
    readonly comments: readonly WorkshopAdminComment[];
    readonly onModerate: (commentId: string, status: Exclude<WorkshopCommentStatus, 'pending'>) => Promise<void>;
};

const CZECH_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });

export function WorkshopCommentModeration({ comments, onModerate }: WorkshopCommentModerationProps) {
    const [processingCommentIds, setProcessingCommentIds] = useState<ReadonlySet<string>>(new Set());
    const sortedComments = [...comments].sort((firstComment, secondComment) => {
        if (firstComment.status === secondComment.status) {
            return Date.parse(secondComment.createdAt) - Date.parse(firstComment.createdAt);
        }
        return firstComment.status === 'pending' ? -1 : secondComment.status === 'pending' ? 1 : 0;
    });

    const handleModeration = async (commentId: string, status: 'approved' | 'rejected') => {
        setProcessingCommentIds((currentIds) => new Set(currentIds).add(commentId));
        await onModerate(commentId, status);
        setProcessingCommentIds((currentIds) => {
            const nextIds = new Set(currentIds);
            nextIds.delete(commentId);
            return nextIds;
        });
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Moderace chatu</h2>
                    <p className="mt-1 text-sm text-slate-500">Pending komentáře nejsou účastníkům viditelné.</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {comments.filter(({ status }) => status === 'pending').length} čeká
                </span>
            </div>

            <div className="mt-6 space-y-3">
                {sortedComments.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
                        <MessageCircle className="mx-auto mb-2 h-6 w-6" />
                        Zatím žádné komentáře
                    </div>
                )}
                {sortedComments.map((comment) => {
                    const isProcessing = processingCommentIds.has(comment.id);
                    return (
                        <article key={comment.id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900">{comment.authorName}</p>
                                    <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                                        <Clock3 className="h-3 w-3" />
                                        {CZECH_DATE_FORMAT.format(new Date(comment.createdAt))}
                                        <ThumbsUp className="ml-2 h-3 w-3" />
                                        {comment.upvoteCount}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${comment.status === 'pending' ? 'bg-amber-100 text-amber-800' : comment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {comment.status}
                                </span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
                            <div className="mt-4 flex justify-end gap-2">
                                {comment.status !== 'rejected' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => void handleModeration(comment.id, 'rejected')}
                                    >
                                        <X className="mr-1.5 h-4 w-4" />
                                        Zamítnout
                                    </Button>
                                )}
                                {comment.status !== 'approved' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => void handleModeration(comment.id, 'approved')}
                                    >
                                        <Check className="mr-1.5 h-4 w-4" />
                                        Schválit
                                    </Button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
