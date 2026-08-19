'use client';

import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
import {
    WorkshopConnectionForm,
    type WorkshopConnectionDetails,
} from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopReactions } from '@/businesses/online-workshop/participant/WorkshopReactions';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import { useWorkshopParticipant } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
import { RefreshCw, Radio } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

type OnlineWorkshopParticipantPageProps = {
    readonly workshopSlug: string;
    readonly connectionDetails: WorkshopConnectionDetails;
    readonly initialEmail: string;
    readonly initialFullname: string;
};

export function OnlineWorkshopParticipantPage({
    workshopSlug,
    connectionDetails,
    initialEmail,
    initialFullname,
}: OnlineWorkshopParticipantPageProps) {
    const controller = useWorkshopParticipant(workshopSlug);

    useEffect(() => {
        if (controller.state === null) {
            return;
        }

        const sanitizedUrl = new URL(window.location.href);
        const isUrlChanged = sanitizedUrl.searchParams.has('email') || sanitizedUrl.searchParams.has('fullname');
        sanitizedUrl.searchParams.delete('email');
        sanitizedUrl.searchParams.delete('fullname');
        if (isUrlChanged) {
            window.history.replaceState(
                window.history.state,
                '',
                `${sanitizedUrl.pathname}${sanitizedUrl.search}${sanitizedUrl.hash}`,
            );
        }
    }, [controller.state]);

    if (controller.isCheckingConnection && controller.state === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#07151d] text-cyan-200">
                <RefreshCw className="h-7 w-7 animate-spin" aria-label="Ověřuji připojení" />
            </main>
        );
    }

    if (controller.isConnectionRequired) {
        return (
            <WorkshopConnectionForm
                connectionDetails={connectionDetails}
                initialEmail={initialEmail}
                initialFullname={initialFullname}
                errorMessage={controller.errorMessage}
                onConnect={controller.connect}
            />
        );
    }

    if (controller.state === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#07151d] px-6 text-center text-slate-200">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
                    <Radio className="mx-auto h-9 w-9 text-cyan-300" />
                    <h1 className="mt-5 text-2xl font-bold text-white">Místnost teď není dostupná</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        {controller.errorMessage ?? 'Připojení k workshopu se nepodařilo ověřit.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => void controller.refresh()}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"
                    >
                        <RefreshCw className="h-4 w-4" /> Zkusit znovu
                    </button>
                </div>
            </main>
        );
    }

    const { state } = controller;

    return (
        <div className="min-h-screen bg-[#06131b] text-slate-200">
            <header className="border-b border-white/[0.07] bg-[#071820]/90 backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] flex-col items-stretch gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Image
                            src="/logo/promptbook-logo-blue-white-256.png"
                            alt="Promptbook"
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-lg"
                        />
                        <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-white">{state.workshop.title}</p>
                            <p className="hidden text-xs text-slate-500 sm:block">Online workshop · Promptbook</p>
                        </div>
                    </div>
                    <div className="flex min-w-0 max-w-full shrink items-center gap-2 self-end rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-medium leading-5 text-emerald-200 sm:self-auto">
                        <Radio className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 break-words text-center">
                            Připojen/a jako {state.participant.fullname}
                        </span>
                        {controller.isRefreshing && <RefreshCw className="h-3 w-3 animate-spin text-slate-500" />}
                    </div>
                </div>
            </header>

            <main className="mx-auto grid w-full min-w-0 max-w-[1500px] grid-cols-1 gap-5 px-4 py-4 sm:px-8 sm:py-5 lg:grid-cols-[minmax(0,1fr)_390px]">
                <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                    {controller.errorMessage && (
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-200">
                            <span className="min-w-0 flex-1 break-words">{controller.errorMessage}</span>
                            <button
                                type="button"
                                onClick={() => void controller.refresh()}
                                className="shrink-0 font-semibold underline underline-offset-4"
                            >
                                Zkusit znovu
                            </button>
                        </div>
                    )}

                    <WorkshopStage
                        workshop={state.workshop}
                        serverTime={state.serverTime}
                        animatedReactions={controller.animatedReactions}
                    />
                    <WorkshopReactions
                        emojis={state.workshop.allowedReactions}
                        isInteractionBanned={state.participant.isInteractionBanned}
                        onReact={controller.react}
                    />
                </div>

                <WorkshopChat
                    className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
                    comments={state.comments}
                    commentSort={controller.commentSort}
                    isInteractionBanned={state.participant.isInteractionBanned}
                    onChangeSort={controller.changeCommentSort}
                    onSubmitComment={controller.submitComment}
                    onUpvoteComment={controller.upvoteComment}
                />

                <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                    <WorkshopContent
                        workshopSlug={workshopSlug}
                        contentBlocks={state.contentBlocks}
                        nextContentUnlockAt={state.nextContentUnlockAt}
                        newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                        onMaterialLinkClick={controller.recordMaterialLinkClick}
                    />
                </div>
            </main>
        </div>
    );
}
