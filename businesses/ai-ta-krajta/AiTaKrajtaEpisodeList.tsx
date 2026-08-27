'use client';

import {
    AI_TA_KRAJTA_EPISODES,
    createAiTaKrajtaSpotifyEpisodeEmbedUrl,
    createAiTaKrajtaSpotifyEpisodeUrl,
} from '@/businesses/ai-ta-krajta/config';
import { Headphones, Play } from 'lucide-react';
import { useState } from 'react';

/**
 * Shows the curated episode list first and loads Spotify only after a listener picks a specific episode.
 */
export function AiTaKrajtaEpisodeList() {
    const [selectedSpotifyEpisodeId, setSelectedSpotifyEpisodeId] = useState<string | null>(null);
    const selectedEpisode = AI_TA_KRAJTA_EPISODES.find(
        (episode) => episode.spotifyEpisodeId === selectedSpotifyEpisodeId,
    );
    const isPlayerShown = selectedEpisode !== undefined;

    return (
        <div className="mx-auto mt-10 max-w-5xl">
            <div className="grid gap-3 md:grid-cols-2">
                {AI_TA_KRAJTA_EPISODES.map((episode) => {
                    const isEpisodeSelected = selectedEpisode?.spotifyEpisodeId === episode.spotifyEpisodeId;

                    return (
                        <article
                            key={episode.spotifyEpisodeId}
                            className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
                                isEpisodeSelected
                                    ? 'border-[#ff8b80]/60 bg-[#ff6b6b]/10'
                                    : 'border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.075]'
                            }`}
                        >
                            <div className="flex h-full items-center gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                                    {episode.number}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45">Díl {episode.number}</p>
                                    <h3 className="mt-1 text-sm font-semibold leading-snug text-white sm:text-base">
                                        {episode.title}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSpotifyEpisodeId(episode.spotifyEpisodeId)}
                                    aria-pressed={isEpisodeSelected}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#303832] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#303832]"
                                >
                                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                                    <span className="sr-only">Pustit díl {episode.number}</span>
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {isPlayerShown && selectedEpisode && (
                <div
                    className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#171d1a] p-3 shadow-2xl sm:p-4"
                    aria-label={`Přehrávač dílu ${selectedEpisode.number}`}
                >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
                        <p className="text-sm font-semibold text-white">Právě posloucháte díl {selectedEpisode.number}</p>
                        <a
                            href={createAiTaKrajtaSpotifyEpisodeUrl(selectedEpisode.spotifyEpisodeId)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#ffaaa2] transition-colors hover:text-white"
                        >
                            <Headphones className="h-4 w-4" />
                            Otevřít ve Spotify
                        </a>
                    </div>
                    <iframe
                        title={`Spotify přehrávač: AI ta Krajta ${selectedEpisode.number}`}
                        src={createAiTaKrajtaSpotifyEpisodeEmbedUrl(selectedEpisode.spotifyEpisodeId)}
                        width="100%"
                        height="352"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="block rounded-xl border-0"
                    />
                </div>
            )}
        </div>
    );
}
