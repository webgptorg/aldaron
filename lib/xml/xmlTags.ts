/**
 * Named XML entities which a document may contain, in addition to the numeric ones
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
 * Writes a tag name so that a regular expression built around it matches that name and nothing else
 */
function escapeTagName(tagName: string): string {
    return tagName.replace(/[:]/g, '\\$&');
}

/**
 * Builds a regular expression matching one element and capturing everything between its tags
 *
 * Note: The name is matched right after the `<`, so that `title` never matches an `itunes:title` of a different
 *       namespace.
 */
function createElementPattern(tagName: string, flags: string): RegExp {
    return new RegExp(`<${escapeTagName(tagName)}(?:\\s[^>]*)?>([\\s\\S]*?)</${escapeTagName(tagName)}>`, flags);
}

/**
 * Reads the text of the first occurrence of one element
 *
 * @param xml fragment of an XML document, for example one `<item>` of a feed
 * @param tagName name of the element including its namespace, for example `itunes:duration`
 * @returns text of the element with its `CDATA` wrapper and its entities resolved, `null` when it is not there
 */
export function readXmlTagText(xml: string, tagName: string): string | null {
    const elementMatch = createElementPattern(tagName, 'i').exec(xml);

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
    const openingTagMatch = new RegExp(`<${escapeTagName(tagName)}(\\s[^>]*)?/?>`, 'i').exec(xml);

    if (openingTagMatch === null || openingTagMatch[1] === undefined) {
        return null;
    }

    const attributeMatch = new RegExp(`\\s${attributeName}\\s*=\\s*"([^"]*)"`, 'i').exec(openingTagMatch[1]);

    return attributeMatch === null ? null : decodeXmlEntities(attributeMatch[1]);
}

/**
 * Lists the inner XML of every occurrence of one element, in the order the document writes them
 *
 * @param tagName name of the repeated element, for example `item` of an RSS feed or `entry` of an Atom one
 */
export function readXmlElements(xml: string, tagName: string): readonly string[] {
    return Array.from(xml.matchAll(createElementPattern(tagName, 'gi')), (elementMatch) => elementMatch[1]);
}
