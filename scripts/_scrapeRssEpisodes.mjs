/**
 * Throwaway helper which lists what the podcast RSS feed says about every episode, so that the internal episode list
 * can be checked against it.
 */
import { readFileSync } from 'node:fs';

const xml = readFileSync(process.argv[2], 'utf8');
const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);

function readTag(itemXml, tagName) {
    const match = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, 'i').exec(itemXml);
    if (match === null) {
        return null;
    }
    const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(match[1]);
    return (cdata === null ? match[1] : cdata[1]).trim();
}

const episodes = items.map((itemXml) => {
    const title = readTag(itemXml, 'title') ?? '';
    const numberMatch = /#\s*(\d+)/.exec(title);
    return {
        number: numberMatch === null ? null : Number(numberMatch[1]),
        title,
        publishedAt: new Date(readTag(itemXml, 'pubDate') ?? 0).toISOString(),
        guid: readTag(itemXml, 'guid'),
    };
});

episodes.sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));

console.log(JSON.stringify(episodes, null, 2));
console.error(`items: ${episodes.length}, numbered: ${episodes.filter((episode) => episode.number !== null).length}`);
