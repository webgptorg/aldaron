'use client';

import { createYoutubeEmbedUrl, createYoutubeWatchUrl } from '@/lib/youtube/youtubeEmbed';
import { ExternalLink, Radio, VideoOff } from 'lucide-react';

type WorkshopStreamPlayerProps = {
    /**
     * Id of the YouTube video which carries the stream, `null` while the stream is not filled in yet
     */
    readonly youtubeVideoId: string | null;

    /**
     * Short note from the organizers shown under the player
     */
    readonly streamNote: string | null;
};

/**
 * The stream itself
 *
 * Note: The player is put into the page only in the moment it may be watched, and it is asked to start playing right
 *       away. A browser which refuses to play on its own still shows its own play button, and the way to YouTube is
 *       right under it.
 */
export function WorkshopStreamPlayer({ youtubeVideoId, streamNote }: WorkshopStreamPlayerProps) {
    if (youtubeVideoId === null) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-8 text-center">
                <VideoOff className="h-8 w-8 text-white/40" />
                <p className="text-lg font-semibold text-white">Stream se právě připravuje</p>
                <p className="max-w-md text-sm leading-relaxed text-white/55">
                    Jakmile pustíme vysílání, video se tu objeví samo. Stránku není potřeba obnovovat.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
                <iframe
                    key={youtubeVideoId}
                    src={createYoutubeEmbedUrl(youtubeVideoId, { isAutoplayed: true })}
                    title="Živý přenos workshopu"
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 font-semibold text-red-200">
                    <Radio className="h-4 w-4" />
                    Živě
                </span>

                {streamNote !== null && <span className="text-white/70">{streamNote}</span>}

                <a
                    href={createYoutubeWatchUrl(youtubeVideoId)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-white/50 underline-offset-4 transition-colors hover:text-white"
                >
                    Nejde přehrát? Otevřít na YouTube
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>
        </div>
    );
}
