'use client';

import { Button } from '@/components/ui/button';
import type { WorkshopAdminParticipant } from '@/lib/workshops/workshopTypes';
import { Ban, Check, Clock3, Mail, MessageCircle, MousePointerClick, Radio, ShieldCheck, ThumbsUp, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

const CZECH_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });

type WorkshopParticipantListProps = {
    readonly participantCount: number;
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly onChangeInteractionBan: (participantId: string, isInteractionBanned: boolean) => Promise<void>;
    readonly onChangeTrusted: (participantId: string, isTrusted: boolean) => Promise<void>;
    readonly onDelete: (participantId: string) => Promise<void>;
};

function formatActiveDuration(activeDurationSeconds: number): string {
    if (activeDurationSeconds < 60) {
        return 'méně než minutu';
    }

    const totalMinutes = Math.floor(activeDurationSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours === 0 ? `${minutes} min` : minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function WorkshopParticipantList({
    participantCount,
    participants,
    onChangeInteractionBan,
    onChangeTrusted,
    onDelete,
}: WorkshopParticipantListProps) {
    const [processingParticipantIds, setProcessingParticipantIds] = useState<ReadonlySet<string>>(new Set());

    const runParticipantAction = async (participantId: string, action: () => Promise<void>) => {
        setProcessingParticipantIds((currentIds) => new Set(currentIds).add(participantId));
        try {
            await action();
        } finally {
            setProcessingParticipantIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(participantId);
                return nextIds;
            });
        }
    };

    const handleDelete = (participant: WorkshopAdminParticipant) => {
        const isDeletionConfirmed = window.confirm(
            `Opravdu trvale smazat účastníka ${participant.fullname}? Smažou se také jeho komentáře, hlasy, reakce a kliknutí na materiály.`,
        );
        if (isDeletionConfirmed) {
            void runParticipantAction(participant.id, () => onDelete(participant.id));
        }
    };

    const isParticipantListComplete = participantCount === participants.length;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <Users className="h-5 w-5 text-cyan-600" /> Účastníci
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {isParticipantListComplete
                            ? `Celkem ${participantCount} účastníků.`
                            : `Zobrazeno ${participants.length} z ${participantCount} účastníků.`}
                    </p>
                </div>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
                    {participantCount}
                </span>
            </div>

            <div className="mt-6 space-y-3">
                {participants.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                        Zatím se nepřipojil žádný účastník.
                    </div>
                ) : (
                    participants.map((participant) => {
                        const isProcessing = processingParticipantIds.has(participant.id);
                        return (
                            <article
                                key={participant.id}
                                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-slate-900">{participant.fullname}</p>
                                        {participant.isTrusted && (
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                                Důvěryhodný
                                            </span>
                                        )}
                                        {participant.isInteractionBanned && (
                                            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                                                Interakce zakázány
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-slate-500">
                                        <Mail className="h-3.5 w-3.5 shrink-0" /> {participant.email}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Připojen/a {CZECH_DATE_FORMAT.format(new Date(participant.connectedAt))} · Naposledy
                                        aktivní {CZECH_DATE_FORMAT.format(new Date(participant.lastSeenAt))}
                                    </p>
                                </div>

                                <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                                        <dt className="flex items-center gap-1 text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Čas</dt>
                                        <dd className="mt-1 font-semibold text-slate-800">{formatActiveDuration(participant.activeDurationSeconds)}</dd>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                                        <dt className="flex items-center gap-1 text-slate-400"><MessageCircle className="h-3.5 w-3.5" /> Komentáře</dt>
                                        <dd className="mt-1 font-semibold text-slate-800">{participant.commentCount}</dd>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                                        <dt className="flex items-center gap-1 text-slate-400"><Radio className="h-3.5 w-3.5" /> Reakce</dt>
                                        <dd className="mt-1 font-semibold text-slate-800">{participant.reactionCount}</dd>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                                        <dt className="flex items-center gap-1 text-slate-400"><MousePointerClick className="h-3.5 w-3.5" /> Kliknutí</dt>
                                        <dd className="mt-1 font-semibold text-slate-800">{participant.linkClickCount}</dd>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                                        <dt className="flex items-center gap-1 text-slate-400"><ThumbsUp className="h-3.5 w-3.5" /> Hlasy</dt>
                                        <dd className="mt-1 font-semibold text-slate-800">{participant.upvoteCount}</dd>
                                    </div>
                                </dl>

                                <div className="flex flex-wrap justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant={participant.isTrusted ? 'outline' : 'secondary'}
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() =>
                                            void runParticipantAction(participant.id, () =>
                                                onChangeTrusted(participant.id, !participant.isTrusted),
                                            )
                                        }
                                    >
                                        <ShieldCheck className="mr-1.5 h-4 w-4" />
                                        {participant.isTrusted ? 'Odebrat důvěru' : 'Označit jako důvěryhodného'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={participant.isInteractionBanned ? 'outline' : 'destructive'}
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() =>
                                            void runParticipantAction(participant.id, () =>
                                                onChangeInteractionBan(participant.id, !participant.isInteractionBanned),
                                            )
                                        }
                                    >
                                        {participant.isInteractionBanned ? (
                                            <><Check className="mr-1.5 h-4 w-4" /> Povolit interakce</>
                                        ) : (
                                            <><Ban className="mr-1.5 h-4 w-4" /> Zakázat interakce</>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => handleDelete(participant)}
                                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                    >
                                        <Trash2 className="mr-1.5 h-4 w-4" /> Smazat
                                    </Button>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}
