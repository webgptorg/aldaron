import { decodeXmlEntities } from '@/lib/xml/xmlTags';

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
 * Note: A podcast description and the description under a video usually end with a long list of links, hashtags and
 *       chapter timestamps. They belong to the platform the episode is published on, not to a summary on a page, so
 *       they are dropped here together with the emoji the editors decorate the description with.
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
