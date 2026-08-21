'use client';

import type { SubscribeToWorkshopReactions } from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import { useWorkshopReactionStream } from '@/components/workshops/useWorkshopReactionStream';
import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import { createYoutubeEmbedUrl } from '@/lib/youtube/youtubeEmbed';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownLeft, Maximize, Radio, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const CLOCK_TICK_MILLISECONDS = 1000;

type WorkshopStageProps = {
    readonly workshop: WorkshopDetails;
    readonly serverTime: string;
    readonly emptyStage?: WorkshopStageEmptyState;

    /**
     * Where the reactions of the room come from
     *
     * Note: The stage keeps the flying reactions itself, so a busy room re-renders nothing but the stage they fly over.
     */
    readonly subscribeToReactions: SubscribeToWorkshopReactions;
};

/**
 * Copy shown when a room is already open but its administrator has not scheduled a YouTube stream yet.
 */
export type WorkshopStageEmptyState = {
    readonly title: string;
    readonly description: string;
};

function getRemainingSegments(remainingMilliseconds: number) {
    const remainingSeconds = Math.max(0, Math.floor(remainingMilliseconds / 1000));
    return [
        { label: 'dní', value: Math.floor(remainingSeconds / 86400) },
        { label: 'hodin', value: Math.floor((remainingSeconds % 86400) / 3600) },
        { label: 'minut', value: Math.floor((remainingSeconds % 3600) / 60) },
        { label: 'sekund', value: remainingSeconds % 60 },
    ];
}

function unmuteYoutubeVideo(videoFrame: HTMLIFrameElement | null): void {
    const playerWindow = videoFrame?.contentWindow;
    if (playerWindow === null || playerWindow === undefined) {
        return;
    }

    playerWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
    playerWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*');
}

function requestVideoFullscreen(videoFrame: HTMLIFrameElement | null): void {
    const requestFullscreen = videoFrame?.requestFullscreen;
    if (requestFullscreen === undefined || videoFrame === null) {
        return;
    }

    void requestFullscreen.call(videoFrame).catch(() => undefined);
}

export function WorkshopStage({ workshop, serverTime, emptyStage, subscribeToReactions }: WorkshopStageProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;
    const serverClockOffset = useMemo(() => Date.parse(serverTime) - Date.now(), [serverTime]);
    const [currentTime, setCurrentTime] = useState(() => Date.now() + serverClockOffset);
    const [isVideoUnmuted, setIsVideoUnmuted] = useState(false);
    const videoFrameReference = useRef<HTMLIFrameElement>(null);
    const { flyingReactions, launchReaction } = useWorkshopReactionStream();

    useEffect(() => subscribeToReactions(launchReaction), [launchReaction, subscribeToReactions]);

    useEffect(() => {
        setCurrentTime(Date.now() + serverClockOffset);
        const intervalId = window.setInterval(
            () => setCurrentTime(Date.now() + serverClockOffset),
            CLOCK_TICK_MILLISECONDS,
        );
        return () => window.clearInterval(intervalId);
    }, [serverClockOffset]);

    useEffect(() => setIsVideoUnmuted(false), [workshop.youtubeVideoId]);

    const remainingMilliseconds = Date.parse(workshop.startsAt) - currentTime;
    const isWorkshopStarted = remainingMilliseconds <= 0;
    const countdownSegments = getRemainingSegments(remainingMilliseconds);
    const handleVideoUnmute = () => {
        unmuteYoutubeVideo(videoFrameReference.current);
        setIsVideoUnmuted(true);
        trackGoogleAnalyticsEvent('workshop_video_unmuted', { workshop_slug: workshop.slug });
    };
    const handleVideoFullscreen = () => requestVideoFullscreen(videoFrameReference.current);

    return (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-2xl">
            <div
                className={`relative min-w-0 w-full max-w-full aspect-video ${isWorkshopStarted ? 'min-h-[220px] sm:min-h-[260px]' : 'min-h-[280px] sm:min-h-[260px]'}`}
            >
                {isWorkshopStarted && workshop.youtubeVideoId ? (
                    <iframe
                        ref={videoFrameReference}
                        className="absolute inset-0 h-full w-full"
                        src={createYoutubeEmbedUrl(workshop.youtubeVideoId, {
                            isAutoplayed: true,
                            isMuted: true,
                            isInlinePlayback: true,
                            isRelatedVideoEnabled: false,
                            isControlsVisible: false,
                            isCaptionsEnabled: false,
                            isJavaScriptApiEnabled: true,
                        })}
                        title={workshop.title}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                ) : isWorkshopStarted ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(48,168,189,.24),transparent_52%)] px-8 text-center">
                        <Radio className="h-11 w-11 animate-pulse text-cyan-300" />
                        <h2 className="mt-5 text-2xl font-bold text-white">
                            {emptyStage?.title ?? 'Stream právě připravujeme'}
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-slate-400">
                            {emptyStage?.description ??
                                'Video se zde objeví automaticky, jakmile administrátor vloží YouTube stream.'}
                        </p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(122,235,255,.16),transparent_42%)] px-4 py-5 text-center sm:px-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-cyan-200 sm:text-xs sm:tracking-[0.18em]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> Začínáme za
                        </span>
                        <div className="mt-5 grid w-full max-w-[19rem] grid-cols-2 gap-2 sm:mt-7 sm:w-auto sm:max-w-none sm:grid-cols-4 sm:gap-4">
                            {countdownSegments.map((segment) => (
                                <div
                                    key={segment.label}
                                    className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-center sm:min-w-[82px] sm:px-4 sm:py-4"
                                >
                                    <div className="font-mono text-3xl font-bold tabular-nums text-white sm:text-4xl">
                                        {String(segment.value).padStart(2, '0')}
                                    </div>
                                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                                        {segment.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 w-full max-w-[25rem] px-2 text-sm leading-6 text-slate-400 sm:mt-6">
                            Stránku nemusíte obnovovat. Stream se spustí automaticky.
                        </p>
                    </div>
                )}

                <WorkshopReactionStream reactions={flyingReactions} />

                {isWorkshopStarted && workshop.youtubeVideoId && (
                    <button
                        type="button"
                        onClick={handleVideoFullscreen}
                        aria-label="Přehrát video na celé obrazovce"
                        className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:border-cyan-200/70 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:right-5 sm:top-5"
                    >
                        <Maximize className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Celá obrazovka</span>
                    </button>
                )}

                {isWorkshopStarted && workshop.youtubeVideoId && !isVideoUnmuted && (
                    <motion.div
                        initial={isReducedMotionPreferred ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-cyan-200/40 bg-slate-950/95 p-3 shadow-2xl backdrop-blur sm:bottom-5 sm:left-6 sm:right-auto sm:max-w-xs sm:p-4"
                    >
                        <div className="flex items-start gap-3">
                            <ArrowDownLeft
                                className="mt-1 h-8 w-8 shrink-0 animate-bounce text-cyan-300"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="text-sm font-bold text-white">Zapněte si zvuk</p>
                                <p className="mt-1 text-xs leading-5 text-slate-300">
                                    Klikněte na tlačítko níže – stream se kvůli automatickému spuštění otevírá ztlumený.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleVideoUnmute}
                                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                                >
                                    <Volume2 className="h-4 w-4" /> Zapnout zvuk
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
