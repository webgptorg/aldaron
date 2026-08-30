/**
 * Throwaway helper which reads the video ids and titles out of a saved YouTube channel page, so that the internal
 * episode list can be written with the video every episode really has.
 */
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');
const lockupPattern = /"lockupViewModel":\{"contentImage":.*?"contentId":"([A-Za-z0-9_-]{11})"/g;

const videosById = new Map();

for (const match of html.matchAll(lockupPattern)) {
    const videoId = match[1];
    const lockup = match[0];
    const titleMatch = /"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/.exec(lockup);
    const durationMatch = /"thumbnailBadgeViewModel":\{"text":"(\d+:\d+(?::\d+)?)"/.exec(lockup);
    const title = titleMatch === null ? null : JSON.parse(`"${titleMatch[1]}"`);

    if (!videosById.has(videoId)) {
        videosById.set(videoId, { title, duration: durationMatch?.[1] ?? null });
    }
}

const episodes = [];

for (const [videoId, video] of videosById) {
    const numberMatch = video.title === null ? null : /#\s*(\d+)/.exec(video.title);
    episodes.push({ videoId, number: numberMatch === null ? null : Number(numberMatch[1]), ...video });
}

episodes.sort((first, second) => (second.number ?? -1) - (first.number ?? -1));

console.log(JSON.stringify(episodes, null, 2));
console.error(`videos: ${episodes.length}, numbered: ${episodes.filter((episode) => episode.number !== null).length}`);
