'use client';

import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import {
    getAiTaKrajtaEpisodeLink,
    type AiTaKrajtaEpisodeLink,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeLink';
import { getAiTaKrajtaEpisodePeople } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { formatAiTaKrajtaDate } from '@/businesses/ai-ta-krajta/aiTaKrajtaFormatting';
import { AiTaKrajtaPersonAvatar } from '@/businesses/ai-ta-krajta/AiTaKrajtaPersonAvatar';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Pause, Play } from 'lucide-react';

/**
 * The round button an episode is started from
 *
 * Note: An episode whose video is already out while its recording is not has nothing to play here, so the very same
 *       button opens that video rather than doing nothing. An episode which is neither playable nor linked anywhere
 *       is left with a button which says so by being dimmed.
 */
function AiTaKrajtaEpisodeControl({
    episode,
    episodeLink,
    isLoaded,
    isPlaying,
    onPlayToggle,
}: {
    readonly episode: AiTaKrajtaEpisode;
    readonly episodeLink: AiTaKrajtaEpisodeLink | null;
    readonly isLoaded: boolean;
    readonly isPlaying: boolean;
    readonly onPlayToggle: () => void;
}) {
    const controlClassName = cn(
        'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform',
        isLoaded ? 'bg-[#ff6b6b] text-[#1a201c]' : 'bg-white/10 text-white group-hover:bg-white/20',
    );

    if (episode.audioUrl !== null) {
        return (
            <button
                type="button"
                onClick={onPlayToggle}
                aria-label={isPlaying ? `Pozastavit ${episode.title}` : `Přehrát ${episode.title}`}
                className={cn(controlClassName, 'hover:scale-105')}
            >
                {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
            </button>
        );
    }

    if (episodeLink === null) {
        return (
            <span aria-hidden="true" className={cn(controlClassName, 'opacity-40')}>
                <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
        );
    }

    return (
        <a
            href={episodeLink.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${episodeLink.label}: ${episode.title}`}
            className={cn(controlClassName, 'hover:scale-105')}
        >
            <ArrowUpRight className="h-5 w-5" />
        </a>
    );
}

/**
 * One episode of the archive, with everything a listener decides by before pressing play
 */
export function AiTaKrajtaEpisodeCard({
    episode,
    isLoaded,
    isPlaying,
    selectedPersonId,
    onPlayToggle,
    onPersonClick,
}: {
    readonly episode: AiTaKrajtaEpisode;

    /**
     * Whether this is the episode the mini player has loaded
     */
    readonly isLoaded: boolean;

    /**
     * Whether this episode is playing right now
     */
    readonly isPlaying: boolean;

    readonly selectedPersonId: string | null;
    readonly onPlayToggle: () => void;
    readonly onPersonClick: (personId: string) => void;
}) {
    const people = getAiTaKrajtaEpisodePeople(episode);
    const episodeLink = getAiTaKrajtaEpisodeLink(episode);

    return (
        <article
            className={cn(
                'group relative rounded-2xl border p-5 transition-colors sm:p-6',
                isLoaded
                    ? 'border-[#ff6b6b]/60 bg-[#ff6b6b]/[0.07]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25',
            )}
        >
            <div className="flex gap-4 sm:gap-5">
                <AiTaKrajtaEpisodeControl
                    episode={episode}
                    episodeLink={episodeLink}
                    isLoaded={isLoaded}
                    isPlaying={isPlaying}
                    onPlayToggle={onPlayToggle}
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                        {episode.number !== null && (
                            <span className="font-semibold text-white/70">#{episode.number}</span>
                        )}
                        <time dateTime={episode.publishedAt}>{formatAiTaKrajtaDate(episode.publishedAt)}</time>
                        {episode.durationInSeconds !== null && (
                            <span>{formatPodcastEpisodeDuration(episode.durationInSeconds)}</span>
                        )}
                    </div>

                    <h3 className="mt-1.5 text-lg font-semibold leading-snug text-white">{episode.shortTitle}</h3>

                    {episode.summary !== '' && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">{episode.summary}</p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                        {people.length > 0 && (
                            <ul className="flex items-center">
                                {people.map((person, personIndex) => (
                                    <li key={person.id} className={cn(personIndex > 0 && '-ml-2')}>
                                        <button
                                            type="button"
                                            onClick={() => onPersonClick(person.id)}
                                            title={`Filtrovat díly s ${person.name}`}
                                            className={cn(
                                                'block rounded-full ring-2 transition-transform hover:z-10 hover:scale-110',
                                                selectedPersonId === person.id
                                                    ? 'ring-[#ff6b6b]'
                                                    : 'ring-[#232a25] hover:ring-white/40',
                                            )}
                                        >
                                            <AiTaKrajtaPersonAvatar person={person} />
                                            <span className="sr-only">{person.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {episodeLink !== null && (
                            <a
                                href={episodeLink.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-white/45 transition-colors hover:text-white"
                            >
                                {episodeLink.label}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
