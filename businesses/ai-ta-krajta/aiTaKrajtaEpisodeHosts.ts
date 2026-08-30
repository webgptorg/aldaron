import { AI_TA_KRAJTA_PEOPLE, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';

/**
 * Heading which separates the roster from the rest of the text in the descriptions the show publishes
 */
const HOST_LIST_HEADING_PATTERN = /host[eé]\s*:/i;

/**
 * Headings which follow a roster and must not be treated as a person's name
 */
const HOST_LIST_END_PATTERN = /děkujeme sponzorům|sítě, kde nás můžete sledovat|kapitoly:/i;

/**
 * One person in the source roster, written after the cowboy-hat marker the show uses
 */
const HOST_LIST_ENTRY_PATTERN = /🤠\s*([^:\n<]+?)\s*:/g;

/**
 * Writes source text the way host names and source headings are compared
 */
function normalizeForHostMatching(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

/**
 * Keeps just the explicit host roster from an unabridged publisher description, still in its original spelling
 */
function readHostListText(descriptionHtml: string): string {
    const hostListHeading = HOST_LIST_HEADING_PATTERN.exec(descriptionHtml);

    if (hostListHeading === null || hostListHeading.index === undefined) {
        return '';
    }

    const textAfterHostListHeading = descriptionHtml.slice(hostListHeading.index + hostListHeading[0].length);
    const hostListEnd = HOST_LIST_END_PATTERN.exec(textAfterHostListHeading);

    return textAfterHostListHeading.slice(0, hostListEnd?.index);
}

/**
 * Whether this source name identifies one of the people the page can render as a profile
 */
function isPersonNamedByHostName(person: AiTaKrajtaPerson, hostName: string): boolean {
    const normalizedPersonName = normalizeForHostMatching(person.name);
    const normalizedHostName = normalizeForHostMatching(hostName);

    return (
        normalizedHostName === normalizedPersonName ||
        person.mentionPatterns.some((pattern) => normalizedHostName.includes(normalizeForHostMatching(pattern)))
    );
}

/**
 * Uses the page's published spelling for a known person, while retaining an unrecognised source name unchanged
 */
function normalizeKnownHostName(hostName: string): string {
    return AI_TA_KRAJTA_PEOPLE.find((person) => isPersonNamedByHostName(person, hostName))?.name ?? hostName;
}

/**
 * Adds a name once, even when one source repeats it with different casing or diacritics
 */
function addHostName(hostNamesByNormalizedName: Map<string, string>, hostName: string): void {
    const trimmedHostName = hostName.trim();

    if (trimmedHostName === '') {
        return;
    }

    const normalizedHostName = normalizeForHostMatching(trimmedHostName);

    if (!hostNamesByNormalizedName.has(normalizedHostName)) {
        hostNamesByNormalizedName.set(normalizedHostName, trimmedHostName);
    }
}

/**
 * Reads the people named under `Hosté:` in a source description
 *
 * Note: Source descriptions are intentionally inspected before generic text cleanup removes their URLs. Several
 *       descriptions join a URL and the `Hosté:` heading without a space, which would otherwise hide that heading.
 *       An unknown name stays in the merged episode as written by the publisher, even if the page has no profile card
 *       for that person yet.
 */
export function readAiTaKrajtaEpisodeHostNames(descriptionHtml: string): readonly string[] {
    const hostListText = readHostListText(descriptionHtml);
    const hostNamesByNormalizedName = new Map<string, string>();

    for (const hostListEntry of Array.from(hostListText.matchAll(HOST_LIST_ENTRY_PATTERN))) {
        addHostName(hostNamesByNormalizedName, normalizeKnownHostName(hostListEntry[1]));
    }

    return Array.from(hostNamesByNormalizedName.values());
}
