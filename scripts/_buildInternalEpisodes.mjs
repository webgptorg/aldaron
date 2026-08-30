/**
 * Throwaway helper which writes the internal episode list out of what the podcast feed and the YouTube channel say
 * today, so that the hardcoded list is typed by neither a human nor a guess.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , rssPath, youtubePath, outputPath] = process.argv;

const xml = readFileSync(rssPath, 'utf8');
const youtubeVideos = JSON.parse(readFileSync(youtubePath, 'utf8'));

/**
 * Upload moments of the videos which the podcast feed does not carry at all, read from their YouTube pages
 */
const YOUTUBE_UPLOADED_AT_BY_VIDEO_ID = {
    P8Z6nbPKklU: '2026-03-12T02:42:13-07:00',
    VgPuJyJL5oE: '2026-03-13T00:30:00-07:00',
    CTzZ0gm5RhQ: '2026-07-20T11:00:23-07:00',
    zbVvChkQQHs: '2026-08-28T07:00:38-07:00',
};

function readTag(itemXml, tagName) {
    const match = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, 'i').exec(itemXml);
    if (match === null) {
        return null;
    }
    const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(match[1]);
    return (cdata === null ? match[1] : cdata[1]).trim().replace(/&amp;/g, '&');
}

function parseDuration(value) {
    if (value === null) {
        return null;
    }
    const parts = value.split(':').map(Number);
    if (parts.some((part) => !Number.isFinite(part))) {
        return null;
    }
    const seconds = parts.reduce((total, part) => total * 60 + part, 0);
    return seconds > 0 ? seconds : null;
}

function normalizeTitle(title) {
    return title
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

const rssEpisodes = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => {
    const itemXml = match[1];
    const title = readTag(itemXml, 'title') ?? '';
    const numberMatch = /#\s*(\d+)/.exec(title);

    return {
        number: numberMatch === null ? null : Number(numberMatch[1]),
        title,
        publishedAt: new Date(readTag(itemXml, 'pubDate') ?? 0).toISOString(),
        durationInSeconds: parseDuration(readTag(itemXml, 'itunes:duration')),
    };
});

const episodesByKey = new Map();

function readKey(number, title) {
    return number === null ? normalizeTitle(title) : String(number);
}

for (const rssEpisode of rssEpisodes) {
    episodesByKey.set(readKey(rssEpisode.number, rssEpisode.title), { ...rssEpisode, youtubeVideoId: null });
}

for (const video of youtubeVideos) {
    const key = readKey(video.number, video.title);
    const existing = episodesByKey.get(key);

    if (existing !== undefined) {
        // Note: The newest video of a number wins, and a second one of the same number is a re-upload or a livestream
        //       recording of it rather than the episode itself.
        if (existing.youtubeVideoId === null) {
            episodesByKey.set(key, { ...existing, youtubeVideoId: video.videoId });
        }
        continue;
    }

    const uploadedAt = YOUTUBE_UPLOADED_AT_BY_VIDEO_ID[video.videoId];

    // Note: Only a video which is a numbered episode and whose moment is known becomes an entry of its own.
    if (video.number === null || uploadedAt === undefined) {
        continue;
    }

    episodesByKey.set(key, {
        number: video.number,
        title: video.title,
        publishedAt: new Date(uploadedAt).toISOString(),
        durationInSeconds: parseDuration(video.duration),
        youtubeVideoId: video.videoId,
    });
}

const episodes = [...episodesByKey.values()].sort((first, second) =>
    second.publishedAt.localeCompare(first.publishedAt),
);

writeFileSync(outputPath, `${JSON.stringify(episodes, null, 4)}\n`, 'utf8');

console.error(
    `episodes: ${episodes.length}, with video: ${episodes.filter((episode) => episode.youtubeVideoId !== null).length}`,
);
