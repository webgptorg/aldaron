'use client';

import { WorkshopCalendarInvitation } from '@/businesses/online-workshop/participant/WorkshopCalendarInvitation';
import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
import {
    WorkshopConnectionForm,
    type WorkshopConnectionDetails,
} from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopParticipantBadge } from '@/businesses/online-workshop/participant/WorkshopParticipantBadge';
import { WorkshopPolls } from '@/businesses/online-workshop/participant/WorkshopPolls';
import { WorkshopReactions } from '@/businesses/online-workshop/participant/WorkshopReactions';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import { WorkshopServerConnectionStatus } from '@/businesses/online-workshop/participant/WorkshopServerConnectionStatus';
import { WorkshopWatchingBadge } from '@/businesses/online-workshop/participant/WorkshopWatchingBadge';
import { useWorkshopParticipantOfflineSupport } from '@/businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport';
import { useWorkshopParticipant } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import { WORKSHOP_SEARCH_PARAMETER_NAME } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopParticipant, WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { RefreshCw, Radio } from 'lucide-react';
import Image from 'next/image';
import { useEffect, type ReactNode } from 'react';

/**
 * What it takes to offer this workshop to the calendar of a participant
 */
export type WorkshopCalendarDetails = {
    readonly hostFullname: string;
    readonly participantPath: string;
};

/**
 * Optional hand-off from a persistent room to individual workshop rooms. The shared participant room only needs the
 * data required to keep a participant identity in those links, never business-specific UI knowledge.
 */
export type WorkshopNavigationDetails = {
    readonly workshops: readonly WorkshopSummary[];
    readonly participantPath: string;
    readonly title: string;
    readonly description: string;
    readonly emptyMessage: string;
    readonly locale: string;
    readonly timeZone: string;
};

type OnlineWorkshopParticipantPageProps = {
    readonly workshopSlug: string;
    readonly connectionDetails: WorkshopConnectionDetails;
    readonly calendarDetails: WorkshopCalendarDetails | null;

    /**
     * Identity carried here by the link which opened the room, offered to the connection form
     *
     * Note: This only ever prefills that form. A connected participant is described by the loaded room itself, so a
     *       returning member who opened no such link is known just as well.
     */
    readonly initialEmail: string;
    readonly initialFullname: string;
    readonly roomSubtitle?: string;
    readonly isWorkshopSelectionInUrl?: boolean;
    readonly workshopNavigation?: WorkshopNavigationDetails;
    readonly materialsTitle?: string;
    readonly unavailableConnectionMessage?: string;

    /**
     * The panels which only the business behind a room has, rendered between the panels shared by every room
     *
     * Note: The room hands over the participant it already verified and knows nothing else about such a panel, so a
     *       room of one business never has to be reimplemented to gain one.
     */
    readonly renderAdditionalPanels?: (participant: WorkshopParticipant) => ReactNode;
};

export function OnlineWorkshopParticipantPage({
    workshopSlug,
    connectionDetails,
    calendarDetails,
    initialEmail,
    initialFullname,
    roomSubtitle = 'Online workshop · Promptbook',
    isWorkshopSelectionInUrl = true,
    workshopNavigation,
    materialsTitle,
    unavailableConnectionMessage = 'Připojení k workshopu se nepodařilo ověřit.',
    renderAdditionalPanels,
}: OnlineWorkshopParticipantPageProps) {
    const controller = useWorkshopParticipant(workshopSlug);
    useWorkshopParticipantOfflineSupport();

    useEffect(() => {
        if (controller.state === null) {
            return;
        }

        const sanitizedUrl = new URL(window.location.href);
        const isWorkshopSelectionChanged = sanitizedUrl.searchParams.get(WORKSHOP_SEARCH_PARAMETER_NAME) !== workshopSlug;
        const isUrlChanged =
            (isWorkshopSelectionInUrl && isWorkshopSelectionChanged) ||
            (!isWorkshopSelectionInUrl && sanitizedUrl.searchParams.has(WORKSHOP_SEARCH_PARAMETER_NAME)) ||
            sanitizedUrl.searchParams.has('email') ||
            sanitizedUrl.searchParams.has('fullname');
        sanitizedUrl.searchParams.delete('email');
        sanitizedUrl.searchParams.delete('fullname');
        if (isWorkshopSelectionInUrl) {
            sanitizedUrl.searchParams.set(WORKSHOP_SEARCH_PARAMETER_NAME, workshopSlug);
        } else {
            sanitizedUrl.searchParams.delete(WORKSHOP_SEARCH_PARAMETER_NAME);
        }
        if (isUrlChanged) {
            window.history.replaceState(
                window.history.state,
                '',
                `${sanitizedUrl.pathname}${sanitizedUrl.search}${sanitizedUrl.hash}`,
            );
        }
    }, [controller.state, isWorkshopSelectionInUrl, workshopSlug]);

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
                        {controller.errorMessage ?? unavailableConnectionMessage}
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
    const roomCapabilities = getWorkshopKindCapabilities(state.workshop.kind);
    const isModerating = isWorkshopParticipantModerating(state.participant);
    const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;

    // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
    //       is one line of the room.
    const isPanelOffered = (panelKey: WorkshopPanelKey) =>
        isWorkshopPanelOffered(state.workshop.kind, state.workshop.disabledPanels, panelKey);

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
                            <p className="hidden text-xs text-slate-500 sm:block">{roomSubtitle}</p>
                        </div>
                    </div>
                    <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                        {isPanelOffered('watching-count') && (
                            <WorkshopWatchingBadge watchingParticipantCount={state.watchingParticipantCount} />
                        )}
                        <WorkshopParticipantBadge
                            fullname={state.participant.fullname}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            isModerating={isModerating}
                            isRefreshing={controller.isRefreshing}
                            onChangeFullname={controller.changeFullname}
                        />
                        <WorkshopServerConnectionStatus
                            isUsingCachedState={controller.isUsingCachedState}
                            isRefreshing={controller.isRefreshing}
                            unavailableMessage={controller.isUsingCachedState ? controller.errorMessage : null}
                            onRefresh={() => void controller.refresh()}
                        />
                    </div>
                </div>
            </header>

            <main className="mx-auto grid w-full min-w-0 max-w-[1500px] grid-cols-1 gap-5 px-4 py-4 sm:px-8 sm:py-5 lg:grid-cols-[minmax(0,1fr)_390px]">
                <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                    {controller.errorMessage && !controller.isUsingCachedState ? (
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
                    ) : null}

                    {roomCapabilities.isStageOffered && (
                        <WorkshopStage
                            workshop={state.workshop}
                            serverTime={state.serverTime}
                            subscribeToReactions={controller.subscribeToReactions}
                            feedback={state.feedback}
                            followUpContentBlock={followUpContentBlock}
                            onSaveFeedback={controller.saveFeedback}
                        />
                    )}
                    {calendarDetails !== null && (
                        <WorkshopCalendarInvitation
                            workshop={state.workshop}
                            serverTime={state.serverTime}
                            hostFullname={calendarDetails.hostFullname}
                            participantPath={calendarDetails.participantPath}
                            participantIdentity={state.participant}
                        />
                    )}
                    {roomCapabilities.isPollsOffered && (
                        <WorkshopPolls
                            polls={state.polls}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            onVote={controller.voteOnPoll}
                        />
                    )}
                    {renderAdditionalPanels?.(state.participant)}
                    {workshopNavigation !== undefined && (
                        <WorkshopLinksPanel
                            workshops={workshopNavigation.workshops}
                            participantPath={workshopNavigation.participantPath}
                            participantIdentity={state.participant}
                            title={workshopNavigation.title}
                            description={workshopNavigation.description}
                            emptyMessage={workshopNavigation.emptyMessage}
                            locale={workshopNavigation.locale}
                            timeZone={workshopNavigation.timeZone}
                        />
                    )}
                    {isPanelOffered('reactions') && (
                        <WorkshopReactions
                            emojis={state.workshop.allowedReactions}
                            reactionCounts={state.reactionCounts}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            onReact={controller.react}
                        />
                    )}
                </div>

                <WorkshopChat
                    className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
                    comments={state.comments}
                    commentSort={controller.commentSort}
                    isEnabled={isPanelOffered('chat')}
                    isInteractionBanned={state.participant.isInteractionBanned}
                    isModerating={isModerating}
                    onChangeSort={controller.changeCommentSort}
                    onSubmitComment={controller.submitComment}
                    onUpvoteComment={controller.upvoteComment}
                    onModerateComment={controller.moderateComment}
                    onModerateAuthor={controller.moderateAuthor}
                />

                <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                    <WorkshopContent
                        contentBlocks={state.contentBlocks}
                        nextContentUnlockAt={state.nextContentUnlockAt}
                        newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                        title={materialsTitle}
                    />
                </div>
            </main>
        </div>
    );
}
