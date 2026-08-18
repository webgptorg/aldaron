'use client';

import { Button } from '@/components/ui/button';
import type { WorkshopAdminParticipant } from '@/lib/workshops/workshopTypes';
import { Ban, Check, Mail, Users } from 'lucide-react';
import { useState } from 'react';

const CZECH_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });

type WorkshopParticipantListProps = {
    readonly participantCount: number;
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly onChangeInteractionBan: (participantId: string, isInteractionBanned: boolean) => Promise<void>;
};

export function WorkshopParticipantList({
    participantCount,
    participants,
    onChangeInteractionBan,
}: WorkshopParticipantListProps) {
    const [processingParticipantIds, setProcessingParticipantIds] = useState<ReadonlySet<string>>(new Set());

    const handleChangeInteractionBan = async (participantId: string, isInteractionBanned: boolean) => {
        setProcessingParticipantIds((currentIds) => new Set(currentIds).add(participantId));
        try {
            await onChangeInteractionBan(participantId, isInteractionBanned);
        } finally {
            setProcessingParticipantIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(participantId);
                return nextIds;
            });
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
                                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900">{participant.fullname}</p>
                                    <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-slate-500">
                                        <Mail className="h-3.5 w-3.5 shrink-0" /> {participant.email}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Připojen/a {CZECH_DATE_FORMAT.format(new Date(participant.connectedAt))} · Naposledy
                                        aktivní {CZECH_DATE_FORMAT.format(new Date(participant.lastSeenAt))}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    {participant.isInteractionBanned && (
                                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                                            Interakce zakázány
                                        </span>
                                    )}
                                    <Button
                                        type="button"
                                        variant={participant.isInteractionBanned ? 'outline' : 'destructive'}
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() =>
                                            void handleChangeInteractionBan(participant.id, !participant.isInteractionBanned)
                                        }
                                    >
                                        {participant.isInteractionBanned ? (
                                            <>
                                                <Check className="mr-1.5 h-4 w-4" /> Povolit interakce
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="mr-1.5 h-4 w-4" /> Zakázat interakce
                                            </>
                                        )}
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
