const CZECH_NUMBER_FORMAT = new Intl.NumberFormat('cs-CZ');

/**
 * Writes a whole number the way Czech writes it, for example `1 275`
 */
export function formatCzechNumber(value: number): string {
    return CZECH_NUMBER_FORMAT.format(value);
}

/**
 * Picks the Czech form of a word which belongs after a number
 *
 * @param count how many there are
 * @param forms the form after one, the form after two up to four, and the form after five and more
 */
export function formatCzechCountedNoun(
    count: number,
    forms: readonly [singular: string, few: string, many: string],
): string {
    const [singular, few, many] = forms;
    const noun = count === 1 ? singular : count >= 2 && count <= 4 ? few : many;

    return `${formatCzechNumber(count)} ${noun}`;
}
