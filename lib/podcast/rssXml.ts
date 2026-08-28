/**
 * Named XML entities which an RSS feed may contain, in addition to the numeric ones
 */
const XML_ENTITY_REPLACEMENTS: Readonly<Record<string, string>> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
};

/**
 * Turns the escaped text of an XML document back into the text it stands for
 *
 * Note: `&amp;` is replaced last, so that a doubly escaped `&amp;lt;` does not turn into a `<` which would look like
 *       markup to everything reading the result.
 */
export function decodeXmlEntities(escapedText: string): string {
    const textWithoutNumericEntities = escapedText
        .replace(/&#x([0-9a-f]+);/gi, (_, hexadecimalCode: string) =>
            String.fromCodePoint(Number.parseInt(hexadecimalCode, 16)),
        )
        .replace(/&#(\d+);/g, (_, decimalCode: string) => String.fromCodePoint(Number.parseInt(decimalCode, 10)));

    return Object.entries(XML_ENTITY_REPLACEMENTS).reduce(
        (text, [entity, replacement]) => text.split(entity).join(replacement),
        textWithoutNumericEntities,
    );
}

/**
 * Builds a regular expression matching one element and capturing everything between its tags
 *
 * Note: The name is matched right after the `<`, so that `title` never matches an `itunes:title` of a different
 *       namespace.
 */
function createElementPattern(tagName: string): RegExp {
    const escapedTagName = tagName.replace(/[:]/g, '\\$&');

    return new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${escapedTagName}>`, 'i');
}

/**
 * Reads the text of the first occurrence of one element
 *
 * @param xml fragment of an XML document, for example one `<item>` of a feed
 * @param tagName name of the element including its namespace, for example `itunes:duration`
 * @returns text of the element with its `CDATA` wrapper and its entities resolved, `null` when it is not there
 */
export function readXmlTagText(xml: string, tagName: string): string | null {
    const elementMatch = createElementPattern(tagName).exec(xml);

    if (elementMatch === null) {
        return null;
    }

    const rawText = elementMatch[1];
    const cdataMatch = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(rawText);

    // Note: Text inside `CDATA` needs no escaping, yet the podcast hosts write `&amp;` and `&quot;` in it anyway.
    //       Resolving the entities there as well is what the publisher meant, and a title which really wanted to
    //       show `&amp;` does not exist in practice.
    return decodeXmlEntities(cdataMatch === null ? rawText : cdataMatch[1]).trim();
}

/**
 * Reads one attribute of the first occurrence of one element, for example the `href` of an `itunes:image`
 *
 * @returns value of the attribute, `null` when either the element or the attribute is not there
 */
export function readXmlTagAttribute(xml: string, tagName: string, attributeName: string): string | null {
    const escapedTagName = tagName.replace(/[:]/g, '\\$&');
    const openingTagMatch = new RegExp(`<${escapedTagName}(\\s[^>]*)?/?>`, 'i').exec(xml);

    if (openingTagMatch === null || openingTagMatch[1] === undefined) {
        return null;
    }

    const attributeMatch = new RegExp(`\\s${attributeName}\\s*=\\s*"([^"]*)"`, 'i').exec(openingTagMatch[1]);

    return attributeMatch === null ? null : decodeXmlEntities(attributeMatch[1]);
}

/**
 * Lists the XML of every `<item>` of a feed, in the order the feed lists them
 */
export function readRssItems(xml: string): readonly string[] {
    return Array.from(xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi), (itemMatch) => itemMatch[1]);
}

/**
 * Everything a feed publishes before its first episode, which is what describes the show itself
 */
export function readRssChannelHeader(xml: string): string {
    const firstItemIndex = xml.search(/<item(?:\s|>)/i);

    return firstItemIndex === -1 ? xml : xml.slice(0, firstItemIndex);
}

/**
 * Emoji, which live outside the basic plane and are therefore written as a pair of surrogates
 *
 * Note: The pattern is spelled out with surrogates rather than with `\u{...}`, because the `u` flag needs a newer
 *       compilation target than this project uses.
 */
const EMOJI_PATTERN = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

/**
 * Arrows, stars and other symbols which a description uses as bullets, together with the two invisible characters
 * which glue an emoji together
 */
const DECORATIVE_SYMBOLS_PATTERN = /[\u2190-\u21FF\u2300-\u23FF\u2500-\u27BF\u2B00-\u2BFF\uFE0F\u200D]/g;

/**
 * A hashtag, whose word may be written with Czech diacritics
 */
const HASHTAG_PATTERN = /#[0-9A-Za-z_\u00C0-\u024F]+/g;

/**
 * A sentence which follows the previous one without the space in between, which is how these descriptions are typed
 */
const MISSING_SPACE_AFTER_SENTENCE_PATTERN = /([.!?,])([A-Z\u00C0-\u00DE\u0100-\u017E])/g;

/**
 * Turns a description written in HTML into one readable paragraph of plain text
 *
 * Note: A podcast description usually ends with a long list of links, hashtags and chapter timestamps. They belong to
 *       the platform the episode is published on, not to a summary on a page, so they are dropped here together with
 *       the emoji the editors decorate the description with.
 */
export function convertHtmlDescriptionToPlainText(html: string): string {
    return decodeXmlEntities(
        html
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/(?:p|div|li|h[1-6])>/gi, ' ')
            .replace(/<[^>]*>/g, ''),
    )
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(HASHTAG_PATTERN, ' ')
        .replace(EMOJI_PATTERN, ' ')
        .replace(DECORATIVE_SYMBOLS_PATTERN, ' ')
        .replace(/\[cite[^\]]*\]/g, ' ')
        .replace(MISSING_SPACE_AFTER_SENTENCE_PATTERN, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
}
