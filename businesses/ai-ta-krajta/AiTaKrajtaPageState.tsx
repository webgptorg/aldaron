'use client';

import type { AiTaKrajtaArchive, AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { filterAiTaKrajtaEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import {
    parseAiTaKrajtaViewState,
    serializeAiTaKrajtaViewState,
    type AiTaKrajtaViewState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import type { AiTaKrajtaCollaborationKind } from '@/businesses/ai-ta-krajta/config';
import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
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
     * Episode loaded in the mini player, `null` when the player is closed
     */
    readonly playingEpisode: AiTaKrajtaEpisode | null;

    readonly viewState: AiTaKrajtaViewState;

    /**
     * Loads one episode into the mini player and starts it
     */
    readonly playEpisode: (episode: AiTaKrajtaEpisode) => void;

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

    const filteredEpisodes = useMemo(
        () =>
            filterAiTaKrajtaEpisodes(archive.episodes, {
                personId: viewState.personId,
                searchQuery: viewState.searchQuery,
            }),
        [archive.episodes, viewState.personId, viewState.searchQuery],
    );

    const playingEpisode = useMemo(
        () => archive.episodes.find((episode) => episode.slug === viewState.playingEpisodeSlug) ?? null,
        [archive.episodes, viewState.playingEpisodeSlug],
    );

    const playEpisode = useCallback(
        (episode: AiTaKrajtaEpisode) =>
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
            playingEpisode,
            viewState,
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
            playingEpisode,
            viewState,
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
