'use client';

import type { AnimatedWorkshopReaction } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import { createYoutubeEmbedUrl } from '@/lib/youtube/youtubeEmbed';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownLeft, Radio, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const CLOCK_TICK_MILLISECONDS = 1000;

type WorkshopStageProps = {
    readonly workshop: WorkshopDetails;
    readonly serverTime: string;
    readonly animatedReactions: readonly AnimatedWorkshopReaction[];
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

function getReactionHorizontalPosition(reactionId: string): number {
    const hash = Array.from(reactionId).reduce((total, character) => total + character.charCodeAt(0), 0);
    return 8 + (hash % 80);
}

function unmuteYoutubeVideo(videoFrame: HTMLIFrameElement | null): void {
    const playerWindow = videoFrame?.contentWindow;
    if (playerWindow === null || playerWindow === undefined) {
        return;
    }

    playerWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
    playerWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*');
}

export function WorkshopStage({ workshop, serverTime, animatedReactions }: WorkshopStageProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;
    const serverClockOffset = useMemo(() => Date.parse(serverTime) - Date.now(), [serverTime]);
    const [currentTime, setCurrentTime] = useState(() => Date.now() + serverClockOffset);
    const [isVideoUnmuted, setIsVideoUnmuted] = useState(false);
    const videoFrameReference = useRef<HTMLIFrameElement>(null);

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

    return (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-2xl">
            <div className="relative aspect-video min-h-[260px]">
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
                        allow="autoplay; encrypted-media; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                ) : isWorkshopStarted ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(48,168,189,.24),transparent_52%)] px-8 text-center">
                        <Radio className="h-11 w-11 animate-pulse text-cyan-300" />
                        <h2 className="mt-5 text-2xl font-bold text-white">Stream právě připravujeme</h2>
                        <p className="mt-2 max-w-md text-sm text-slate-400">
                            Video se zde objeví automaticky, jakmile administrátor vloží YouTube stream.
                        </p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(122,235,255,.16),transparent_42%)] px-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> Začínáme za
                        </span>
                        <div className="mt-7 grid grid-cols-4 gap-2 sm:gap-4">
                            {countdownSegments.map((segment) => (
                                <div
                                    key={segment.label}
                                    className="min-w-[58px] rounded-xl border border-white/10 bg-white/5 px-2 py-4 text-center sm:min-w-[82px] sm:px-4"
                                >
                                    <div className="font-mono text-2xl font-bold tabular-nums text-white sm:text-4xl">
                                        {String(segment.value).padStart(2, '0')}
                                    </div>
                                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                                        {segment.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-sm text-slate-400">
                            Stránku nemusíte obnovovat. Stream se spustí automaticky.
                        </p>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                    <AnimatePresence>
                        {animatedReactions.map((reaction) => (
                            <motion.span
                                key={reaction.animationId}
                                aria-hidden="true"
                                className="absolute bottom-3 text-4xl drop-shadow-xl"
                                style={{ left: `${getReactionHorizontalPosition(reaction.id)}%` }}
                                initial={{ opacity: 0, y: isReducedMotionPreferred ? 0 : 20, scale: 0.6, rotate: -12 }}
                                animate={
                                    isReducedMotionPreferred
                                        ? { opacity: [0, 1, 0], scale: [0.9, 1, 1] }
                                        : {
                                              opacity: [0, 1, 1, 0],
                                              y: -230,
                                              scale: [0.6, 1.25, 1],
                                              rotate: [0, 8, -5],
                                          }
                                }
                                exit={{ opacity: 0 }}
                                transition={{ duration: isReducedMotionPreferred ? 0.8 : 2.6, ease: 'easeOut' }}
                            >
                                {reaction.emoji}
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>

                {isWorkshopStarted && workshop.youtubeVideoId && !isVideoUnmuted && (
                    <motion.div
                        initial={isReducedMotionPreferred ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-5 left-4 z-20 max-w-xs rounded-2xl border border-cyan-200/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur sm:left-6"
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
