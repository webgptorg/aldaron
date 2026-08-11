/**
 * How a YouTube video can be written down
 *
 * Note: Whoever fills a video in should be able to paste whatever YouTube shows in the address bar, including the
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
 * @param videoId id of the video the player is to play
 * @param isAutoplayed whether the player starts on its own the moment it appears, which only makes sense where the
 *                     visitor already asked for the video and expects it to simply run
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
 * Address of the still image YouTube renders for a video, used wherever a whole player would be too heavy
 *
 * Note: The widescreen `maxresdefault` variant is asked for, because every other one is padded with black bars which
 *       would show up inside a card built for the 16:9 ratio.
 */
export function createYoutubeThumbnailUrl(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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
