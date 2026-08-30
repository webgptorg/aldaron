/**
 * How long a slug made out of a title may be, which is short enough to be read in an address bar and long enough to
 * tell two episodes of one show apart
 */
const TITLE_SLUG_LENGTH = 44;

/**
 * Escapes the text so that a regular expression built around it matches exactly that text
 */
function escapeRegularExpression(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reads the number a title writes as `#64`
 *
 * Note: Every place which publishes the same show repeats that number in the title, which is what lets one episode be
 *       recognized across the feed, the video channel and the list kept in the application.
 *
 * @returns number of the episode, `null` for a special which is published outside the numbering
 */
export function readPodcastEpisodeNumberFromTitle(title: string): number | null {
    const titleNumberMatch = /#\s*(\d+)/.exec(title);

    return titleNumberMatch === null ? null : Number(titleNumberMatch[1]);
}

/**
 * Turns a title into the part which actually says what the episode is about
 *
 * @param title full title, for example `AI ta Krajta #64 | Ctyri AI lidri opousteji Google`
 * @param showTitle name of the show which every title repeats
 */
export function createPodcastEpisodeShortTitle(title: string, showTitle: string | undefined): string {
    const titleAfterSeparator = title.includes('|') ? title.slice(title.indexOf('|') + 1) : title;
    const titleWithoutShowTitle =
        showTitle === undefined
            ? titleAfterSeparator
            : titleAfterSeparator.replace(new RegExp(`^\\s*${escapeRegularExpression(showTitle)}\\s*`, 'i'), '');

    return titleWithoutShowTitle.replace(/^[\s#\d|:.-]+/, '').trim() || title;
}

/**
 * Turns a title into the part of a link which says which episode it leads to
 */
export function createPodcastEpisodeTitleSlug(title: string): string {
    return title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, TITLE_SLUG_LENGTH)
        .replace(/^-+|-+$/g, '');
}

/**
 * The short identifier one episode is known by, which is its number when it has one
 *
 * Note: This is also what tells the sources of an archive that they are describing the same episode, so every source
 *       has to work it out the same way.
 *
 * @param number number of the episode, `null` for a special
 * @param title title the episode is published under
 */
export function createPodcastEpisodeSlug(number: number | null, title: string): string {
    return number === null ? createPodcastEpisodeTitleSlug(title) : String(number);
}
