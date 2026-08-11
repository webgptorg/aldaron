'use client';

import { ONLINE_WORKSHOP_DEFAULT_SETTINGS, ONLINE_WORKSHOP_ID } from '@/businesses/online-workshop/config';
import { WorkshopChatPanel } from '@/businesses/online-workshop/participant/WorkshopChatPanel';
import { WorkshopContentBlocks } from '@/businesses/online-workshop/participant/WorkshopContentBlocks';
import { WorkshopCountdown } from '@/businesses/online-workshop/participant/WorkshopCountdown';
import { WorkshopJoinForm } from '@/businesses/online-workshop/participant/WorkshopJoinForm';
import { WorkshopReactionsBar } from '@/businesses/online-workshop/participant/WorkshopReactionsBar';
import { WorkshopRoomHeader } from '@/businesses/online-workshop/participant/WorkshopRoomHeader';
import { WorkshopStreamPlayer } from '@/businesses/online-workshop/participant/WorkshopStreamPlayer';
import { useParticipantIdentity } from '@/businesses/online-workshop/participant/useParticipantIdentity';
import { useWorkshopState } from '@/businesses/online-workshop/participant/useWorkshopState';
import { MinimalFooter } from '@/components/minimal-footer';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { cn } from '@/lib/utils';
import { getCountdownParts } from '@/lib/workshop/countdown';
import { EMPTY_REACTION_SUMMARIES } from '@/lib/workshop/summarizeReactions';
import type { WorkshopSettings } from '@/lib/workshop/workshopTypes';
import { Radio } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * How often the countdown is redrawn
 */
const COUNTDOWN_REFRESH_INTERVAL_MS = 1000;

/**
 * Page a registered participant spends the workshop on
 *
 * Note: Everything it shows - the moment of the start, the stream, the unlocked materials, the chat and the
 *       reactions - comes from the server, so the organizers steer the whole room from the administration without
 *       anybody having to reload anything.
 */
export function OnlineWorkshopParticipantPage() {
    const { participantIdentity, isIdentityLoaded, joinAsParticipant, leaveWorkshop } = useParticipantIdentity();
    const { workshopState, errorMessage, serverTimeOffsetMs, sendMessageToChat, sendReactionEmoji } = useWorkshopState(
        ONLINE_WORKSHOP_ID,
        participantIdentity,
    );

    const browserTime = useCurrentTime(COUNTDOWN_REFRESH_INTERVAL_MS);

    // Note: The clock of the participant can be off by minutes, the countdown runs on the clock of the server
    const currentTime = browserTime === null ? null : new Date(browserTime.getTime() + serverTimeOffsetMs);

    const settings: WorkshopSettings = workshopState?.settings || ONLINE_WORKSHOP_DEFAULT_SETTINGS;
    const startsAtTime = new Date(settings.startsAt);
    const isCountdownElapsed = currentTime !== null && getCountdownParts(startsAtTime, currentTime).isElapsed;
    const isStreamShown = settings.isStreamLive || isCountdownElapsed;

    if (!isIdentityLoaded) {
        return <WorkshopRoomLayout participantName={null} onChangeParticipantName={leaveWorkshop} isCentered />;
    }

    if (participantIdentity === null) {
        return (
            <WorkshopRoomLayout participantName={null} onChangeParticipantName={leaveWorkshop} isCentered>
                <div className="grid w-full items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
                    <div>
                        <WorkshopStatusBadge isStreamShown={isStreamShown} />
                        <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
                            {settings.title}
                        </h1>
                        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
                            {isStreamShown
                                ? 'Workshop právě běží. Napiš svoje jméno a připoj se k ostatním.'
                                : 'Jsi na správném místě. Napiš svoje jméno a uvidíš odpočet do začátku i celý workshop.'}
                        </p>

                        {!isStreamShown && (
                            <div className="mt-8">
                                <WorkshopCountdown targetTime={startsAtTime} currentTime={currentTime} />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center lg:justify-end">
                        <WorkshopJoinForm onJoin={joinAsParticipant} />
                    </div>
                </div>
            </WorkshopRoomLayout>
        );
    }

    return (
        <WorkshopRoomLayout
            participantName={participantIdentity.participantName}
            onChangeParticipantName={leaveWorkshop}
        >
            <section className="py-8">
                <WorkshopStatusBadge isStreamShown={isStreamShown} />
                <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">{settings.title}</h1>

                {!isStreamShown && (
                    <>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
                            Vysílání se spustí samo, jakmile odpočet doběhne. Stránku nech klidně otevřenou.
                        </p>
                        <div className="mt-6">
                            <WorkshopCountdown targetTime={startsAtTime} currentTime={currentTime} />
                        </div>
                    </>
                )}
            </section>

            {errorMessage !== null && workshopState === null && (
                <p className="mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                    Spojení s workshopem se zatím nedaří navázat. Zkoušíme to dál, stránku není potřeba obnovovat.
                </p>
            )}

            <div className="grid gap-6 pb-16 lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]">
                <div className="min-w-0 space-y-6">
                    {isStreamShown && (
                        <WorkshopStreamPlayer
                            youtubeVideoId={settings.youtubeVideoId}
                            streamNote={settings.streamNote}
                        />
                    )}

                    <WorkshopReactionsBar
                        reactions={workshopState?.reactions || EMPTY_REACTION_SUMMARIES}
                        onSendReaction={sendReactionEmoji}
                    />

                    <div>
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
                            Materiály k workshopu
                        </h2>
                        <WorkshopContentBlocks contentBlocks={workshopState?.contentBlocks || []} />
                    </div>
                </div>

                <div className="min-w-0 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
                    <WorkshopChatPanel
                        chatMessages={workshopState?.chatMessages || []}
                        participantId={participantIdentity.participantId}
                        isChatEnabled={settings.isChatEnabled}
                        onSendMessage={sendMessageToChat}
                    />
                </div>
            </div>
        </WorkshopRoomLayout>
    );
}

/**
 * Whether the workshop is running right now, or still waiting for its moment
 */
function WorkshopStatusBadge({ isStreamShown }: { isStreamShown: boolean }) {
    if (isStreamShown) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200">
                <Radio className="h-4 w-4" />
                Vysíláme živě
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Workshop začne za
        </span>
    );
}

/**
 * The dark room the whole workshop happens in
 */
function WorkshopRoomLayout({
    participantName,
    onChangeParticipantName,
    isCentered = false,
    children,
}: {
    participantName: string | null;
    onChangeParticipantName: () => void;

    /**
     * Whether the content is held in the middle of the screen, which suits the short joining screen
     */
    isCentered?: boolean;

    children?: ReactNode;
}) {
    return (
        <div
            className="flex min-h-screen flex-col bg-slate-950"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.88), rgba(2, 6, 23, 0.98)), url(/backgrounds/ai-supervize.svg)`,
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Note: The rendered Markdown of the materials has to read well on the dark background of the room */}
            <style>{`
                .workshop-markdown a {
                    color: #7aebff;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .workshop-markdown h1,
                .workshop-markdown h2,
                .workshop-markdown h3,
                .workshop-markdown h4,
                .workshop-markdown strong {
                    color: #ffffff;
                }
                .workshop-markdown h1,
                .workshop-markdown h2,
                .workshop-markdown h3,
                .workshop-markdown h4 {
                    font-weight: 700;
                    margin-top: 1.25em;
                    margin-bottom: 0.5em;
                }
                .workshop-markdown p,
                .workshop-markdown ul,
                .workshop-markdown ol,
                .workshop-markdown pre,
                .workshop-markdown blockquote {
                    margin-bottom: 0.85em;
                }
                .workshop-markdown ul {
                    list-style: disc;
                    padding-left: 1.35em;
                }
                .workshop-markdown ol {
                    list-style: decimal;
                    padding-left: 1.35em;
                }
                .workshop-markdown code {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 0.35em;
                    padding: 0.1em 0.35em;
                    font-size: 0.9em;
                }
                .workshop-markdown pre {
                    background: rgba(0, 0, 0, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 0.75em;
                    padding: 1em;
                    overflow-x: auto;
                }
                .workshop-markdown pre code {
                    background: transparent;
                    padding: 0;
                }
                .workshop-markdown blockquote {
                    border-left: 3px solid rgba(122, 235, 255, 0.5);
                    padding-left: 1em;
                    color: rgba(255, 255, 255, 0.7);
                }
            `}</style>

            <WorkshopRoomHeader
                participantName={participantName}
                onChangeParticipantName={onChangeParticipantName}
            />

            <main className={cn('container mx-auto flex-1 px-4', isCentered && 'flex items-center')}>{children}</main>

            <MinimalFooter />
        </div>
    );
}
