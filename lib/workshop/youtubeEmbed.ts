/**
 * How a YouTube video can be written down in the administration
 *
 * Note: Whoever fills the stream in should be able to paste whatever YouTube shows in the address bar, including the
 *       `/live/` url of a stream, not only the bare id.
 */
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_URL_PATH_PREFIXES = ['/embed/', '/live/', '/v/', '/shorts/'] as const;

/**
 * Read the id of the video out of anything a YouTube link can look like, `null` when there is no video in it
 */
export function extractYoutubeVideoId(value: string | null): string | null {
    const trimmedValue = (value || '').trim();

    if (trimmedValue === '') {
        return null;
    }

    if (YOUTUBE_VIDEO_ID_PATTERN.test(trimmedValue)) {
        return trimmedValue;
    }

    const videoUrl = parseUrlOrNull(trimmedValue);

    if (videoUrl === null) {
        return null;
    }

    const videoIdFromQuery = videoUrl.searchParams.get('v');

    if (videoIdFromQuery !== null && YOUTUBE_VIDEO_ID_PATTERN.test(videoIdFromQuery)) {
        return videoIdFromQuery;
    }

    for (const pathPrefix of YOUTUBE_URL_PATH_PREFIXES) {
        if (videoUrl.pathname.startsWith(pathPrefix)) {
            const videoIdFromPath = videoUrl.pathname.slice(pathPrefix.length).split('/')[0] || '';

            return YOUTUBE_VIDEO_ID_PATTERN.test(videoIdFromPath) ? videoIdFromPath : null;
        }
    }

    if (videoUrl.hostname.endsWith('youtu.be')) {
        const videoIdFromShortUrl = videoUrl.pathname.slice(1).split('/')[0] || '';

        return YOUTUBE_VIDEO_ID_PATTERN.test(videoIdFromShortUrl) ? videoIdFromShortUrl : null;
    }

    return null;
}

/**
 * Address of the player which is put into the page
 *
 * Note: The player is asked to start on its own the moment it appears, because the participant already clicked
 *       through the joining form and expects the stream to simply run.
 */
export function createYoutubeEmbedUrl(videoId: string, { isAutoplayed }: { isAutoplayed: boolean }): string {
    const playerParams = new URLSearchParams({
        autoplay: isAutoplayed ? '1' : '0',
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
    });

    return `https://www.youtube-nocookie.com/embed/${videoId}?${playerParams.toString()}`;
}

/**
 * Address of the video on YouTube itself, offered as a way out when the embedded player refuses to play
 */
export function createYoutubeWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Parse an address, `null` when the text is not one
 */
function parseUrlOrNull(value: string): URL | null {
    try {
        return new URL(value.startsWith('http') ? value : `https://${value}`);
    } catch {
        return null;
    }
}
