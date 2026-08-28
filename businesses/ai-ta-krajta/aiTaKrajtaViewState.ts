import { getAiTaKrajtaPersonById } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_PATH,
    type AiTaKrajtaCollaborationKind,
} from '@/businesses/ai-ta-krajta/config';
import {
    createEnumeratedValueCodec,
    defineUrlViewParameter,
    FLAG_VALUE_CODEC,
    parseUrlViewState,
    serializeUrlViewState,
    TEXT_VALUE_CODEC,
    type UrlViewParameter,
    type UrlViewValueCodec,
} from '@/lib/api/urlViewState';

/**
 * Everything the visitor did on the page, so that the link they copy opens exactly what they were looking at
 */
export type AiTaKrajtaViewState = {
    /**
     * Person the archive is narrowed down to, `null` for the whole archive
     */
    readonly personId: string | null;

    /**
     * What the visitor typed into the search field
     */
    readonly searchQuery: string;

    /**
     * Episode which is loaded in the mini player, `null` when the player is closed
     */
    readonly playingEpisodeSlug: string | null;

    /**
     * Whether that episode is playing right now rather than paused
     */
    readonly isPlaying: boolean;

    /**
     * Whether the archive lists every episode instead of the newest ones
     */
    readonly isWholeArchiveShown: boolean;

    /**
     * Whether the snake in the header woke up and turned into the game
     */
    readonly isGamePlayed: boolean;

    /**
     * Which kind of collaboration the form at the bottom is filled in for
     */
    readonly collaborationKind: AiTaKrajtaCollaborationKind;
};

/**
 * The page as it opens for someone who followed a plain link
 */
export const DEFAULT_AI_TA_KRAJTA_VIEW_STATE: AiTaKrajtaViewState = {
    personId: null,
    searchQuery: '',
    playingEpisodeSlug: null,
    isPlaying: false,
    isWholeArchiveShown: false,
    isGamePlayed: false,
    collaborationKind: AI_TA_KRAJTA_COLLABORATION_OPTIONS[0].id,
};

/**
 * Kind of collaboration which is one of the offered ones, so that a hand written link cannot ask for something the
 * form does not offer
 */
const COLLABORATION_KIND_VALUE_CODEC = createEnumeratedValueCodec(
    AI_TA_KRAJTA_COLLABORATION_OPTIONS.map((option) => option.id),
);

/**
 * Identifier of somebody who is really in the roster, so that a mistyped link shows the whole archive instead of
 * an empty one
 */
const PERSON_VALUE_CODEC: UrlViewValueCodec<string | null> = {
    parseValue: (parameterValue) => getAiTaKrajtaPersonById(parameterValue.trim())?.id ?? null,
    serializeValue: (value) => value ?? '',
};

/**
 * Slug of an episode, which the archive resolves against the feed when the page opens
 */
const EPISODE_VALUE_CODEC: UrlViewValueCodec<string | null> = {
    parseValue: (parameterValue) => parameterValue.trim() || null,
    serializeValue: (value) => value ?? '',
};

function defineAiTaKrajtaViewParameter<TValue>(
    parameter: UrlViewParameter<AiTaKrajtaViewState, TValue>,
): UrlViewParameter<AiTaKrajtaViewState, unknown> {
    return defineUrlViewParameter<AiTaKrajtaViewState, TValue>(parameter);
}

/**
 * Every query parameter of the page, each one owning exactly one part of the view
 */
const AI_TA_KRAJTA_VIEW_PARAMETERS: readonly UrlViewParameter<AiTaKrajtaViewState, unknown>[] = [
    defineAiTaKrajtaViewParameter<string | null>({
        parameterName: 'osoba',
        ...PERSON_VALUE_CODEC,
        readValue: (viewState) => viewState.personId,
        writeValue: (viewState, personId) => ({ ...viewState, personId }),
    }),
    defineAiTaKrajtaViewParameter<string>({
        parameterName: 'hledat',
        ...TEXT_VALUE_CODEC,
        readValue: (viewState) => viewState.searchQuery,
        writeValue: (viewState, searchQuery) => ({ ...viewState, searchQuery }),
    }),
    defineAiTaKrajtaViewParameter<string | null>({
        parameterName: 'dil',
        ...EPISODE_VALUE_CODEC,
        readValue: (viewState) => viewState.playingEpisodeSlug,
        writeValue: (viewState, playingEpisodeSlug) => ({ ...viewState, playingEpisodeSlug }),
    }),
    defineAiTaKrajtaViewParameter<boolean>({
        parameterName: 'hraje',
        ...FLAG_VALUE_CODEC,
        readValue: (viewState) => viewState.isPlaying,
        writeValue: (viewState, isPlaying) => ({ ...viewState, isPlaying }),
    }),
    defineAiTaKrajtaViewParameter<boolean>({
        parameterName: 'archiv',
        ...FLAG_VALUE_CODEC,
        readValue: (viewState) => viewState.isWholeArchiveShown,
        writeValue: (viewState, isWholeArchiveShown) => ({ ...viewState, isWholeArchiveShown }),
    }),
    defineAiTaKrajtaViewParameter<boolean>({
        parameterName: 'hra',
        ...FLAG_VALUE_CODEC,
        readValue: (viewState) => viewState.isGamePlayed,
        writeValue: (viewState, isGamePlayed) => ({ ...viewState, isGamePlayed }),
    }),
    defineAiTaKrajtaViewParameter<AiTaKrajtaCollaborationKind>({
        parameterName: 'zajem',
        ...COLLABORATION_KIND_VALUE_CODEC,
        readValue: (viewState) => viewState.collaborationKind,
        writeValue: (viewState, collaborationKind) => ({ ...viewState, collaborationKind }),
    }),
];

/**
 * Reads the view out of a shared link
 */
export function parseAiTaKrajtaViewState(searchParams: URLSearchParams): AiTaKrajtaViewState {
    return parseUrlViewState(AI_TA_KRAJTA_VIEW_PARAMETERS, DEFAULT_AI_TA_KRAJTA_VIEW_STATE, searchParams);
}

/**
 * Writes the view into the link which can be shared, leaving out everything which is still the default
 */
export function serializeAiTaKrajtaViewState(
    viewState: AiTaKrajtaViewState,
    searchParams: URLSearchParams,
): URLSearchParams {
    return serializeUrlViewState(
        AI_TA_KRAJTA_VIEW_PARAMETERS,
        DEFAULT_AI_TA_KRAJTA_VIEW_STATE,
        viewState,
        searchParams,
    );
}

/**
 * Builds the link which opens the page with one episode playing
 *
 * Note: The page has one address, so a link to an episode is that address with the episode chosen. Both the structured
 *       data and the share button of the mini player build it here, so a shared link always behaves the same.
 *
 * @param episodeSlug short identifier of the episode, for example `64`
 * @returns site relative link, for example `/ai-ta-krajta?dil=64&hraje=1`
 */
export function createAiTaKrajtaEpisodePath(episodeSlug: string): string {
    const searchParams = serializeAiTaKrajtaViewState(
        { ...DEFAULT_AI_TA_KRAJTA_VIEW_STATE, playingEpisodeSlug: episodeSlug, isPlaying: true },
        new URLSearchParams(),
    );

    return `${AI_TA_KRAJTA_PATH}?${searchParams.toString()}`;
}
