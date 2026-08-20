'use client';

import { Button } from '@/components/ui/button';
import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import type { WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import { Pin, PinOff } from 'lucide-react';

type WorkshopPinnedCommentProps = {
    readonly pinnedComment: WorkshopCommentReference | null;
    readonly isProcessing: boolean;
    readonly onUnpin: (commentId: string) => void;
};

/**
 * The one message which holds the top of the chat
 *
 * Note: The moderation list shows a single moderation state at a time, so the pinned message is repeated here to be
 *       readable and releasable whichever state the admin is going through.
 */
export function WorkshopPinnedComment({ pinnedComment, isProcessing, onUnpin }: WorkshopPinnedCommentProps) {
    if (pinnedComment === null) {
        return (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                <Pin className="mr-1.5 inline h-4 w-4" />
                Na začátku chatu není připnutá žádná zpráva.
            </div>
        );
    }

    return (
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-800">
                        <Pin className="h-3.5 w-3.5" /> Připnuto na začátku chatu
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{pinnedComment.authorName}</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => onUnpin(pinnedComment.id)}
                    aria-label={`Odepnout komentář od ${pinnedComment.authorName}`}
                    className="bg-white"
                >
                    <PinOff className="mr-1.5 h-4 w-4" /> Odepnout
                </Button>
            </div>
            <WorkshopCommentMarkdown
                content={pinnedComment.body}
                className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700"
            />
        </div>
    );
}
