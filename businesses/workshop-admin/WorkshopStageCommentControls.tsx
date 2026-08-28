'use client';

import { Button } from '@/components/ui/button';
import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import type { WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import { MessageCircleQuestion, X } from 'lucide-react';

type WorkshopStageCommentControlsProps = {
    readonly stageComment: WorkshopCommentReference | null;
    readonly isProcessing: boolean;
    readonly onClear: (commentId: string) => void;
};

/**
 * Keeps the current live-stage question visible in the comments administration, even when its ordinary chat status is
 * not the one the administrator is filtering right now.
 */
export function WorkshopStageCommentControls({
    stageComment,
    isProcessing,
    onClear,
}: WorkshopStageCommentControlsProps) {
    if (stageComment === null) {
        return (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                <MessageCircleQuestion className="mr-1.5 inline h-4 w-4" />
                Na stage teď není žádná otázka.
            </div>
        );
    }

    return (
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-800">
                        <MessageCircleQuestion className="h-3.5 w-3.5" /> Otázka na stage
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{stageComment.authorName}</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => onClear(stageComment.id)}
                    aria-label={`Skrýt komentář od ${stageComment.authorName} ze stage`}
                    className="bg-white"
                >
                    <X className="mr-1.5 h-4 w-4" /> Skrýt ze stage
                </Button>
            </div>
            <WorkshopCommentMarkdown
                content={stageComment.body}
                className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700"
            />
        </div>
    );
}
