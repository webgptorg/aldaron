'use client';

import type { WorkshopArtificialCommentValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    MAXIMAL_WORKSHOP_COMMENT_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { MessageCirclePlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopArtificialCommentProps = {
    readonly onCreate: (values: WorkshopArtificialCommentValues) => Promise<boolean>;
};

/**
 * Keeps artificial comments alongside comment moderation, instead of mixing them into the reactions administration.
 */
export function WorkshopArtificialComment({ onCreate }: WorkshopArtificialCommentProps) {
    const [authorName, setAuthorName] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!authorName.trim() || !commentBody.trim()) {
            return;
        }

        setIsCreatingComment(true);
        const isCreated = await onCreate({ authorName, body: commentBody });
        setIsCreatingComment(false);
        if (isCreated) {
            setAuthorName('');
            setCommentBody('');
        }
    };

    return (
        <section className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <MessageCirclePlus className="h-5 w-5 text-violet-600" /> Umělý komentář
            </h2>
            <p className="mt-1 text-sm text-slate-600">
                Komentář zůstane v databázi i administraci výslovně označený jako umělý.
            </p>
            <form onSubmit={handleCreate} className="mt-5 max-w-2xl rounded-xl border border-violet-200 bg-white p-5">
                <label className="block text-xs font-medium text-slate-600">
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
                    Text komentáře
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
        </section>
    );
}
