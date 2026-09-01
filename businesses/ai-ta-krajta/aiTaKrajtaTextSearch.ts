/**
 * Writes text the way it is compared, so that `Koblížkem` and `koblizkem` are the same word
 */
export function normalizeAiTaKrajtaSearchText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

/**
 * Splits what a visitor typed into the words every result must contain
 */
export function createAiTaKrajtaSearchWords(searchQuery: string): readonly string[] {
    return normalizeAiTaKrajtaSearchText(searchQuery).split(/\s+/).filter(Boolean);
}

/**
 * Whether a piece of text contains every word the visitor is looking for
 */
export function isAiTaKrajtaTextMatchingSearchWords(text: string, searchWords: readonly string[]): boolean {
    const normalizedText = normalizeAiTaKrajtaSearchText(text);

    return searchWords.every((searchWord) => normalizedText.includes(searchWord));
}
