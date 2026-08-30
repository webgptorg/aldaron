/**
 * Everything a feed publishes before its first episode, which is what describes the show itself
 */
export function readRssChannelHeader(xml: string): string {
    const firstItemIndex = xml.search(/<item(?:\s|>)/i);

    return firstItemIndex === -1 ? xml : xml.slice(0, firstItemIndex);
}
