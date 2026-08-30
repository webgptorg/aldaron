/**
 * How far back a half-played episode jumps when it is resumed, in seconds
 *
 * Note: A podcast application never continues on the exact word it was interrupted on, because a sentence heard from
 *       its middle is a sentence heard twice. A few seconds of what is already known lead the listener back in.
 */
export const PODCAST_EPISODE_RESUME_REWIND_IN_SECONDS = 5;

/**
 * How close to the end of a recording counts as having heard it to the end, in seconds
 *
 * Note: The last half minute of an episode is an outro, and a listener who leaves during it has heard the episode.
 *       Without this, an archive would keep almost every finished episode marked as unfinished.
 */
export const PODCAST_EPISODE_COMPLETION_TOLERANCE_IN_SECONDS = 30;

/**
 * How much of an episode has to be heard before it counts as started, in seconds
 *
 * Note: Pressing play and immediately pressing it again is not listening to an episode, so it must not leave a
 *       progress bar on it either.
 */
export const PODCAST_EPISODE_STARTED_THRESHOLD_IN_SECONDS = 10;

/**
 * What a listener did with one episode, which is what an archive marks it with
 */
export type PodcastEpisodePlaybackStatus = 'unplayed' | 'partiallyPlayed' | 'played';

/**
 * How far a listener got in one episode, as it is remembered between visits
 */
export type PodcastEpisodePlaybackProgress = {
    /**
     * Position the recording was left at, in seconds
     */
    readonly positionInSeconds: number;

    /**
     * Length of the recording as the browser measured it, `null` when it was never loaded far enough to know
     */
    readonly durationInSeconds: number | null;

    /**
     * Whether the listener reached the end of the recording
     *
     * Note: This is remembered rather than derived from the position, because an episode can be played to its end
     *       before its length is known, and because the end is a fact the player reports rather than a calculation.
     */
    readonly isPlayed: boolean;

    /**
     * When this was last written down, in milliseconds since the epoch
     */
    readonly updatedAt: number;
};

/**
 * One reading of where a recording stands, as the player takes it off its audio element
 */
export type PodcastEpisodePlayback = {
    readonly positionInSeconds: number;
    readonly durationInSeconds: number | null;

    /**
     * Whether the recording just ran out rather than being left in the middle
     */
    readonly isEnded: boolean;
};

/**
 * A length which is really a length, because an audio element reports `NaN` and `Infinity` for a recording it does not
 * know yet
 */
function readDurationInSeconds(durationInSeconds: number | null): number | null {
    if (durationInSeconds === null || !Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
        return null;
    }

    return durationInSeconds;
}

/**
 * From where on a recording counts as heard to its end
 *
 * Note: The tolerance is a fixed half minute of outro, which would be most of a recording only a minute long and all
 *       of a shorter one. Half of a recording is therefore always heard before it counts as heard whole.
 */
function getCompletionPositionInSeconds(durationInSeconds: number): number {
    return Math.max(durationInSeconds / 2, durationInSeconds - PODCAST_EPISODE_COMPLETION_TOLERANCE_IN_SECONDS);
}

/**
 * The length to reckon a position against, preferring what the player measured over what the feed states
 */
function getReckonedDurationInSeconds(
    progress: PodcastEpisodePlaybackProgress,
    episodeDurationInSeconds: number | null,
): number | null {
    return readDurationInSeconds(progress.durationInSeconds) ?? readDurationInSeconds(episodeDurationInSeconds);
}

/**
 * Writes down where a listener got to in one episode
 *
 * @param playback where the recording stands right now
 * @returns progress to remember for this episode
 */
export function createPodcastEpisodePlaybackProgress(playback: PodcastEpisodePlayback): PodcastEpisodePlaybackProgress {
    const durationInSeconds = readDurationInSeconds(playback.durationInSeconds);
    const positionInSeconds = Math.max(0, Math.round(playback.positionInSeconds));
    const heardPositionInSeconds =
        durationInSeconds === null ? positionInSeconds : Math.min(positionInSeconds, Math.round(durationInSeconds));
    const isPlayed =
        playback.isEnded ||
        (durationInSeconds !== null && heardPositionInSeconds >= getCompletionPositionInSeconds(durationInSeconds));

    return {
        positionInSeconds: heardPositionInSeconds,
        durationInSeconds,
        isPlayed,
        updatedAt: Date.now(),
    };
}

/**
 * Tells what an archive should mark an episode with
 *
 * @param progress what is remembered about the episode, `null` for an episode nobody started
 */
export function getPodcastEpisodePlaybackStatus(
    progress: PodcastEpisodePlaybackProgress | null,
): PodcastEpisodePlaybackStatus {
    if (progress === null) {
        return 'unplayed';
    }

    if (progress.isPlayed) {
        return 'played';
    }

    if (progress.positionInSeconds < PODCAST_EPISODE_STARTED_THRESHOLD_IN_SECONDS) {
        return 'unplayed';
    }

    return 'partiallyPlayed';
}

/**
 * Where playing an episode should start
 *
 * Note: An episode which was heard to its end starts from its beginning again, the way a podcast application replays
 *       one, while a half-played one resumes a few seconds before it was left.
 *
 * @param progress what is remembered about the episode, `null` for an episode nobody started
 * @returns position in seconds, `0` for an episode which is started rather than resumed
 */
export function getPodcastEpisodeResumePositionInSeconds(progress: PodcastEpisodePlaybackProgress | null): number {
    if (progress === null || getPodcastEpisodePlaybackStatus(progress) !== 'partiallyPlayed') {
        return 0;
    }

    return Math.max(0, progress.positionInSeconds - PODCAST_EPISODE_RESUME_REWIND_IN_SECONDS);
}

/**
 * How much of a half-played episode is still ahead of the listener
 *
 * @param progress what is remembered about the episode, `null` for an episode nobody started
 * @param episodeDurationInSeconds length the feed states, used when the player never measured one
 * @returns remaining seconds, `null` when no length is known
 */
export function getPodcastEpisodeRemainingInSeconds(
    progress: PodcastEpisodePlaybackProgress | null,
    episodeDurationInSeconds: number | null,
): number | null {
    if (progress === null) {
        return null;
    }

    const durationInSeconds = getReckonedDurationInSeconds(progress, episodeDurationInSeconds);

    if (durationInSeconds === null) {
        return null;
    }

    return Math.max(0, Math.round(durationInSeconds - progress.positionInSeconds));
}

/**
 * How much of an episode is behind the listener, as a share of the whole
 *
 * @param progress what is remembered about the episode, `null` for an episode nobody started
 * @param episodeDurationInSeconds length the feed states, used when the player never measured one
 * @returns share between `0` and `1`, `null` when no length is known
 */
export function getPodcastEpisodePlayedRatio(
    progress: PodcastEpisodePlaybackProgress | null,
    episodeDurationInSeconds: number | null,
): number | null {
    if (progress === null) {
        return null;
    }

    if (progress.isPlayed) {
        return 1;
    }

    const durationInSeconds = getReckonedDurationInSeconds(progress, episodeDurationInSeconds);

    if (durationInSeconds === null) {
        return null;
    }

    return Math.min(1, Math.max(0, progress.positionInSeconds / durationInSeconds));
}

/**
 * Whether a value read back out of the browser is progress this application wrote
 *
 * Note: Only this application ever writes it, but a value from an older version of the page or an edited one must look
 *       like an episode nobody started rather than break the archive.
 */
export function isPodcastEpisodePlaybackProgress(value: unknown): value is PodcastEpisodePlaybackProgress {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const { positionInSeconds, durationInSeconds, isPlayed, updatedAt } = value as Record<string, unknown>;

    return (
        typeof positionInSeconds === 'number' &&
        Number.isFinite(positionInSeconds) &&
        positionInSeconds >= 0 &&
        (durationInSeconds === null || (typeof durationInSeconds === 'number' && Number.isFinite(durationInSeconds))) &&
        typeof isPlayed === 'boolean' &&
        typeof updatedAt === 'number' &&
        Number.isFinite(updatedAt)
    );
}
