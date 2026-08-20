'use client';

import { WorkshopChatComposer } from '@/businesses/online-workshop/participant/WorkshopChatComposer';
import { WorkshopChatThread } from '@/businesses/online-workshop/participant/WorkshopChatThread';
import { WORKSHOP_FADED_PANEL_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopPanelAppearance';
import type { WorkshopCommentValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { cn } from '@/lib/utils';
import { getWorkshopChatInteractivity } from '@/lib/workshops/workshopChatInteractivity';
import { buildWorkshopCommentThreads } from '@/lib/workshops/workshopCommentThreads';
import type { WorkshopComment, WorkshopCommentSort } from '@/lib/workshops/workshopTypes';
import { Clock3, Lock, MessageCircle, ThumbsUp } from 'lucide-react';
import { useMemo } from 'react';

type WorkshopChatProps = {
    readonly className?: string;
    readonly comments: readonly WorkshopComment[];
    readonly commentSort: WorkshopCommentSort;

    /**
     * Whether the chat still belongs to the participants, or only stays on the page to be read
     */
    readonly isEnabled: boolean;
    readonly isInteractionBanned: boolean;
    readonly onChangeSort: (sort: WorkshopCommentSort) => void;
    readonly onSubmitComment: (values: WorkshopCommentValues) => Promise<boolean>;
    readonly onUpvoteComment: (commentId: string) => Promise<void>;
};

export function WorkshopChat({
    className,
    comments,
    commentSort,
    isEnabled,
    isInteractionBanned,
    onChangeSort,
    onSubmitComment,
    onUpvoteComment,
}: WorkshopChatProps) {
    const threads = useMemo(() => buildWorkshopCommentThreads(comments, commentSort), [comments, commentSort]);
    const interactivity = getWorkshopChatInteractivity({ isChatEnabled: isEnabled, isInteractionBanned });

    return (
        <aside
            className={cn(
                'flex h-[min(70dvh,38rem)] min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1c26] shadow-2xl',
                'lg:sticky lg:top-5 lg:h-[calc(100dvh-6.5rem)] lg:min-h-0',
                !isEnabled && WORKSHOP_FADED_PANEL_CLASS_NAME,
                className,
            )}
        >
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

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {threads.length === 0 ? (
                    <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
                        <MessageCircle className="h-8 w-8 text-slate-700" />
                        <p className="mt-3 text-sm text-slate-500">Zatím je tu klid. Položte první otázku.</p>
                    </div>
                ) : (
                    threads.map((thread) => (
                        <WorkshopChatThread
                            key={thread.comment.id}
                            thread={thread}
                            interactivity={interactivity}
                            onSubmitComment={onSubmitComment}
                            onUpvoteComment={onUpvoteComment}
                        />
                    ))
                )}
            </div>

            {interactivity.isWritingOffered ? (
                <WorkshopChatComposer
                    className="border-t border-white/10 p-4"
                    label="Nová zpráva do chatu"
                    placeholder="Napište otázku nebo komentář…"
                    onSubmit={(body) => onSubmitComment({ body, parentCommentId: null })}
                />
            ) : (
                <p className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-4 text-sm text-slate-500">
                    <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Chat je teď jen pro čtení.
                </p>
            )}
        </aside>
    );
}
