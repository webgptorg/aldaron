/**
 * Keeps a text within the room a card, a preview or a social image has for it
 *
 * Note: The ellipsis is counted into the length, so a shortened text never grows past what was asked for.
 *
 * @param value text as it was written
 * @param maximumLength how many characters the result may have at most
 */
export function shortenText(value: string, maximumLength: number): string {
    if (value.length <= maximumLength) {
        return value;
    }

    return `${value.slice(0, maximumLength - 1).trimEnd()}…`;
}
