/**
 * The commands which a page sends to the player of a YouTube video it has embedded
 *
 * Note: The player listens to them only when the embed address enables the JavaScript API, see `createYoutubeEmbedUrl`.
 */

/**
 * The player is served from a YouTube address which the page does not need to know in order to command it
 */
const YOUTUBE_PLAYER_TARGET_ORIGIN = '*';

const FULL_YOUTUBE_PLAYER_VOLUME = 100;

/**
 * The subtitles are a module of the player, named one way by the current player and another way by the older one
 */
const YOUTUBE_SUBTITLE_MODULE_NAMES = ['captions', 'cc'];

/**
 * How often and how many times the request to hide the subtitles is repeated after the video appeared
 *
 * Note: A player which has just been placed on the page is not listening yet and a live broadcast can turn its own
 *       subtitles on a moment later, so a single request at the beginning would be lost.
 */
const SUBTITLE_HIDING_ATTEMPT_INTERVAL_MILLISECONDS = 1000;
const SUBTITLE_HIDING_ATTEMPT_COUNT = 10;

function sendYoutubePlayerCommand(
    videoFrame: HTMLIFrameElement | null,
    commandName: string,
    commandArguments: readonly unknown[] = [],
): void {
    const playerWindow = videoFrame?.contentWindow;
    if (playerWindow === null || playerWindow === undefined) {
        return;
    }

    playerWindow.postMessage(
        JSON.stringify({ event: 'command', func: commandName, args: commandArguments }),
        YOUTUBE_PLAYER_TARGET_ORIGIN,
    );
}

/**
 * Turns the sound of the player on, because a video which starts on its own may only start muted
 */
export function unmuteYoutubeVideo(videoFrame: HTMLIFrameElement | null): void {
    sendYoutubePlayerCommand(videoFrame, 'unMute');
    sendYoutubePlayerCommand(videoFrame, 'setVolume', [FULL_YOUTUBE_PLAYER_VOLUME]);
}

/**
 * Takes the subtitles away from the player
 *
 * Note: The `cc_load_policy=0` of the embed address only keeps the subtitles from being turned on by default, while a
 *       viewer who has them turned on in their own YouTube account is shown them anyway until the module is unloaded.
 */
export function hideYoutubeVideoSubtitles(videoFrame: HTMLIFrameElement | null): void {
    YOUTUBE_SUBTITLE_MODULE_NAMES.forEach((moduleName) =>
        sendYoutubePlayerCommand(videoFrame, 'unloadModule', [moduleName]),
    );
}

/**
 * Takes the subtitles away from the player and keeps asking for a while, until the player which has just appeared
 * listens
 *
 * @returns Function which stops the asking
 */
export function keepYoutubeVideoSubtitlesHidden(videoFrame: HTMLIFrameElement | null): () => void {
    hideYoutubeVideoSubtitles(videoFrame);

    let remainingAttemptCount = SUBTITLE_HIDING_ATTEMPT_COUNT;
    const intervalId = window.setInterval(() => {
        hideYoutubeVideoSubtitles(videoFrame);

        remainingAttemptCount -= 1;
        if (remainingAttemptCount <= 0) {
            window.clearInterval(intervalId);
        }
    }, SUBTITLE_HIDING_ATTEMPT_INTERVAL_MILLISECONDS);

    return () => window.clearInterval(intervalId);
}
