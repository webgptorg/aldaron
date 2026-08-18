'use client';

import type {
    WorkshopArtificialCommentValues,
    WorkshopArtificialReactionValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    MAXIMAL_WORKSHOP_COMMENT_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
    MAXIMAL_WORKSHOP_REACTION_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { MessageCirclePlus, Radio, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const INITIAL_ARTIFICIAL_REACTION = '🚀';

type WorkshopArtificialActivityProps = {
    readonly reactionCount: number;
    readonly artificialReactionCount: number;
    readonly onCreateArtificialComment: (values: WorkshopArtificialCommentValues) => Promise<boolean>;
    readonly onSendArtificialReaction: (values: WorkshopArtificialReactionValues) => Promise<boolean>;
    readonly onClearReactions: () => Promise<boolean>;
};

export function WorkshopArtificialActivity({
    reactionCount,
    artificialReactionCount,
    onCreateArtificialComment,
    onSendArtificialReaction,
    onClearReactions,
}: WorkshopArtificialActivityProps) {
    const [authorName, setAuthorName] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [reactionEmoji, setReactionEmoji] = useState(INITIAL_ARTIFICIAL_REACTION);
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [isSendingReaction, setIsSendingReaction] = useState(false);
    const [isClearingReactions, setIsClearingReactions] = useState(false);

    const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!authorName.trim() || !commentBody.trim()) {
            return;
        }

        setIsCreatingComment(true);
        const isCreated = await onCreateArtificialComment({ authorName, body: commentBody });
        setIsCreatingComment(false);
        if (isCreated) {
            setAuthorName('');
            setCommentBody('');
        }
    };

    const handleSendReaction = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!reactionEmoji.trim()) {
            return;
        }

        setIsSendingReaction(true);
        const isSent = await onSendArtificialReaction({ emoji: reactionEmoji });
        setIsSendingReaction(false);
        if (isSent) {
            setReactionEmoji(INITIAL_ARTIFICIAL_REACTION);
        }
    };

    const handleClearReactions = async () => {
        const isDeletionConfirmed = window.confirm(
            `Opravdu smazat všech ${reactionCount} reakcí? Tento krok nelze vrátit zpět.`,
        );
        if (!isDeletionConfirmed) {
            return;
        }

        setIsClearingReactions(true);
        await onClearReactions();
        setIsClearingReactions(false);
    };

    return (
        <section className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-6 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-950">Umělé aktivity</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Tyto akce jsou v administraci i databázi výslovně označené jako umělé, nikdy jako akce účastníka.
                </p>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <form onSubmit={handleCreateComment} className="rounded-xl border border-violet-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-950">
                        <MessageCirclePlus className="h-4 w-4" /> Umělý komentář
                    </div>
                    <label className="mt-4 block text-xs font-medium text-slate-600">
                        Zobrazené jméno autora
                        <Input
                            value={authorName}
                            onChange={(event) => setAuthorName(event.target.value)}
                            className="mt-1 bg-white"
                            maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH}
                            placeholder="Například Petra z týmu"
                            required
                        />
                    </label>
                    <label className="mt-4 block text-xs font-medium text-slate-600">
                        Text umělého komentáře
                        <Textarea
                            value={commentBody}
                            onChange={(event) => setCommentBody(event.target.value)}
                            className="mt-1 min-h-28 bg-white"
                            maxLength={MAXIMAL_WORKSHOP_COMMENT_LENGTH}
                            placeholder="Přidejte otázku nebo komentář do živého chatu…"
                            required
                        />
                    </label>
                    <Button type="submit" size="sm" disabled={isCreatingComment} className="mt-4">
                        <MessageCirclePlus className="mr-2 h-4 w-4" />
                        {isCreatingComment ? 'Přidávám…' : 'Přidat umělý komentář'}
                    </Button>
                </form>

                <form onSubmit={handleSendReaction} className="rounded-xl border border-violet-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-950">
                        <Radio className="h-4 w-4" /> Umělá reakce
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        Lze odeslat libovolnou reakci, i když není v nabídce účastníků. Odesláno umělých reakcí:{' '}
                        {artificialReactionCount}. Celkem reakcí: {reactionCount}.
                    </p>
                    <label className="mt-4 block text-xs font-medium text-slate-600">
                        Reakce
                        <Input
                            value={reactionEmoji}
                            onChange={(event) => setReactionEmoji(event.target.value)}
                            className="mt-1 bg-white text-lg"
                            maxLength={MAXIMAL_WORKSHOP_REACTION_LENGTH}
                            placeholder="🚀"
                            required
                        />
                    </label>
                    <Button type="submit" size="sm" disabled={isSendingReaction} className="mt-4">
                        <Radio className="mr-2 h-4 w-4" />
                        {isSendingReaction ? 'Odesílám…' : 'Odeslat umělou reakci'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isClearingReactions || reactionCount === 0}
                        onClick={() => void handleClearReactions()}
                        className="mt-4 ml-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> {isClearingReactions ? 'Mažu…' : 'Smazat všechny reakce'}
                    </Button>
                </form>
            </div>
        </section>
    );
}
