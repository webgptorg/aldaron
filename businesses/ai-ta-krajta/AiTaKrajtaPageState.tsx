'use client';

import {
    isPlayableAiTaKrajtaEpisode,
    type AiTaKrajtaArchive,
    type AiTaKrajtaEpisode,
    type PlayableAiTaKrajtaEpisode,
} from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { filterAiTaKrajtaEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { useAiTaKrajtaEpisodeTranscriptSearch } from '@/businesses/ai-ta-krajta/useAiTaKrajtaEpisodeTranscriptSearch';
import {
    parseAiTaKrajtaViewState,
    serializeAiTaKrajtaViewState,
    type AiTaKrajtaViewState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import {
    AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY,
    type AiTaKrajtaCollaborationKind,
} from '@/businesses/ai-ta-krajta/config';
import { usePodcastPlaybackProgress } from '@/hooks/usePodcastPlaybackProgress';
import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import type { PodcastEpisodePlayback, PodcastEpisodePlaybackProgress } from '@/lib/podcast/podcastPlaybackProgress';
import type { PodcastPlaybackProgressByEpisodeSlug } from '@/lib/podcast/podcastPlaybackProgressStorage';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

/**
 * Everything the sections of the page share, which is the archive of the show and what the visitor did with it
 */
type AiTaKrajtaPageStateValue = {
    readonly archive: AiTaKrajtaArchive;

    /**
     * Episodes left after the filter of the visitor, newest first
     */
    readonly filteredEpisodes: readonly AiTaKrajtaEpisode[];

    /**
     * Whether the current search still waits for the server-only transcript matches
     */
    readonly isTranscriptSearchPending: boolean;

    /**
     * Episode loaded in the mini player, `null` when the player is closed
     */
    readonly playingEpisode: PlayableAiTaKrajtaEpisode | null;

    /**
     * Newest episode there is a recording of, which is what the buttons offering to listen play
     *
     * Note: This is not always the newest episode. The video of an episode regularly comes out before its recording
     *       is published, and an episode which cannot be played must not be what a `Poslouchat` button loads.
     */
    readonly newestPlayableEpisode: PlayableAiTaKrajtaEpisode | null;

    readonly viewState: AiTaKrajtaViewState;

    /**
     * How far this browser got in every episode it ever played, so the archive can mark them
     *
     * Note: This is empty until the page is mounted, because only a browser knows what it remembers.
     */
    readonly playbackProgressByEpisodeSlug: PodcastPlaybackProgressByEpisodeSlug;

    /**
     * Whether the browser has already said what it remembers, which the player waits for before resuming an episode
     * it was opened straight on
     */
    readonly isPlaybackProgressRestored: boolean;

    /**
     * How far this browser got in one episode, as it stands at this very moment rather than as it was last rendered
     */
    readonly getEpisodePlaybackProgress: (episodeSlug: string | null) => PodcastEpisodePlaybackProgress | null;

    /**
     * Writes down where the listener got to in one episode
     */
    readonly recordEpisodePlaybackProgress: (episodeSlug: string, playback: PodcastEpisodePlayback) => void;

    /**
     * Loads one episode into the mini player and starts it
     */
    readonly playEpisode: (episode: PlayableAiTaKrajtaEpisode) => void;

    /**
     * Starts the loaded episode or pauses it
     */
    readonly setIsPlaying: (isPlaying: boolean) => void;

    readonly closePlayer: () => void;

    /**
     * Narrows the archive down to one person, or widens it back when that person is already chosen
     */
    readonly togglePersonFilter: (personId: string) => void;

    readonly setSearchQuery: (searchQuery: string) => void;
    readonly showWholeArchive: () => void;
    readonly setCollaborationKind: (collaborationKind: AiTaKrajtaCollaborationKind) => void;
};

const AiTaKrajtaPageStateContext = createContext<AiTaKrajtaPageStateValue | null>(null);

/**
 * Holds the one state of the page and keeps it in the address bar
 *
 * Note: The filter, chosen episode and collaboration choice live in the query parameters. The game is deliberately
 *       local to its terrarium, because a copied link should not start an interactive animation unexpectedly.
 */
export function AiTaKrajtaPageStateProvider({
    archive,
    children,
}: {
    readonly archive: AiTaKrajtaArchive;
    readonly children: ReactNode;
}) {
    const [viewState, changeViewState] = useUrlSynchronizedViewState<AiTaKrajtaViewState>({
        parseViewState: parseAiTaKrajtaViewState,
        serializeViewState: serializeAiTaKrajtaViewState,
    });

    // Note: What was played is deliberately not in the address bar. A link is shared with somebody else, while what a
    //       listener already heard belongs to their browser alone.
    const {
        playbackProgressByEpisodeSlug,
        isPlaybackProgressRestored,
        getEpisodePlaybackProgress,
        recordEpisodePlaybackProgress,
    } = usePodcastPlaybackProgress(AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY);

    const { transcriptMatchingEpisodeSlugs, isTranscriptSearchPending } = useAiTaKrajtaEpisodeTranscriptSearch(
        viewState.searchQuery,
    );

    const filteredEpisodes = useMemo(
        () =>
            filterAiTaKrajtaEpisodes(archive.episodes, {
                personId: viewState.personId,
                searchQuery: viewState.searchQuery,
                transcriptMatchingEpisodeSlugs,
            }),
        [archive.episodes, transcriptMatchingEpisodeSlugs, viewState.personId, viewState.searchQuery],
    );

    const playableEpisodes = useMemo(
        () => archive.episodes.filter(isPlayableAiTaKrajtaEpisode),
        [archive.episodes],
    );

    // Note: The player exists to play a recording, so a link naming an episode which has none simply opens the page
    //       with the player closed instead of showing a player with nothing in it.
    const playingEpisode = useMemo(
        () => playableEpisodes.find((episode) => episode.slug === viewState.playingEpisodeSlug) ?? null,
        [playableEpisodes, viewState.playingEpisodeSlug],
    );

    const newestPlayableEpisode = playableEpisodes[0] ?? null;

    const playEpisode = useCallback(
        (episode: PlayableAiTaKrajtaEpisode) =>
            changeViewState((previousViewState) => ({
                ...previousViewState,
                playingEpisodeSlug: episode.slug,
                isPlaying: true,
            })),
        [changeViewState],
    );

    const setIsPlaying = useCallback(
        (isPlaying: boolean) => changeViewState((previousViewState) => ({ ...previousViewState, isPlaying })),
        [changeViewState],
    );

    const closePlayer = useCallback(
        () =>
            changeViewState((previousViewState) => ({
                ...previousViewState,
                playingEpisodeSlug: null,
                isPlaying: false,
            })),
        [changeViewState],
    );

    const togglePersonFilter = useCallback(
        (personId: string) =>
            changeViewState((previousViewState) => ({
                ...previousViewState,
                personId: previousViewState.personId === personId ? null : personId,
            })),
        [changeViewState],
    );

    const setSearchQuery = useCallback(
        (searchQuery: string) => changeViewState((previousViewState) => ({ ...previousViewState, searchQuery })),
        [changeViewState],
    );

    const showWholeArchive = useCallback(
        () => changeViewState((previousViewState) => ({ ...previousViewState, isWholeArchiveShown: true })),
        [changeViewState],
    );

    const setCollaborationKind = useCallback(
        (collaborationKind: AiTaKrajtaCollaborationKind) =>
            changeViewState((previousViewState) => ({ ...previousViewState, collaborationKind })),
        [changeViewState],
    );

    const pageState = useMemo<AiTaKrajtaPageStateValue>(
        () => ({
            archive,
            filteredEpisodes,
            isTranscriptSearchPending,
            playingEpisode,
            newestPlayableEpisode,
            viewState,
            playbackProgressByEpisodeSlug,
            isPlaybackProgressRestored,
            getEpisodePlaybackProgress,
            recordEpisodePlaybackProgress,
            playEpisode,
            setIsPlaying,
            closePlayer,
            togglePersonFilter,
            setSearchQuery,
            showWholeArchive,
            setCollaborationKind,
        }),
        [
            archive,
            filteredEpisodes,
            isTranscriptSearchPending,
            playingEpisode,
            newestPlayableEpisode,
            viewState,
            playbackProgressByEpisodeSlug,
            isPlaybackProgressRestored,
            getEpisodePlaybackProgress,
            recordEpisodePlaybackProgress,
            playEpisode,
            setIsPlaying,
            closePlayer,
            togglePersonFilter,
            setSearchQuery,
            showWholeArchive,
            setCollaborationKind,
        ],
    );

    return <AiTaKrajtaPageStateContext.Provider value={pageState}>{children}</AiTaKrajtaPageStateContext.Provider>;
}

/**
 * Reads the state of the page from any of its sections
 */
export function useAiTaKrajtaPageState(): AiTaKrajtaPageStateValue {
    const pageState = useContext(AiTaKrajtaPageStateContext);

    if (pageState === null) {
        throw new Error('The section is rendered outside of AiTaKrajtaPageStateProvider');
    }

    return pageState;
}
