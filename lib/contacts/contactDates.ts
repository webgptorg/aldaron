import moment, { type Moment } from 'moment';

/**
 * Formats in which the date carried by a contact can be written, tried in this order
 *
 * Note: `moment.ISO_8601` covers both what the database returns and what our own exports write, the rest are the ways
 *       a date is written by hand or by another application which gathers into the very same table.
 *
 * Why: Every handwritten format here starts with the day, because that is how a date is written in the places the
 *      contacts come from. Guessing instead of asking for these formats reads the very same text the other way
 *      around - `new Date('11. 8. 2026')` is the eighth of November and not the eleventh of August.
 */
const CONTACT_DATE_FORMATS: readonly (string | moment.MomentBuiltinFormat)[] = [
    moment.ISO_8601,
    'D. M. YYYY H:mm:ss',
    'D. M. YYYY H:mm',
    'D. M. YYYY',
    'DD. MM. YYYY HH:mm:ss',
    'DD. MM. YYYY HH:mm',
    'DD. MM. YYYY',
    'D.M.YYYY H:mm:ss',
    'D.M.YYYY H:mm',
    'D.M.YYYY',
    'DD.MM.YYYY HH:mm:ss',
    'DD.MM.YYYY HH:mm',
    'DD.MM.YYYY',
];

/**
 * Read the point in time which one date value of a contact stands for
 *
 * Note: This is the single source of truth of what the date of a contact means, so that the table, the sorting, the
 *       date range filter and both exports can never read one and the same value as two different days
 *
 * @returns The moment the value stands for, or `null` when it holds no date which can be read at all
 */
export function parseContactDate(dateText: string | null): Moment | null {
    if (dateText === null) {
        return null;
    }

    const trimmedDateText = dateText.trim();

    if (trimmedDateText === '') {
        return null;
    }

    const dateInKnownFormat = moment(trimmedDateText, [...CONTACT_DATE_FORMATS], true);

    if (dateInKnownFormat.isValid()) {
        return dateInKnownFormat;
    }

    // Note: A format which nobody wrote down is still worth one last guess, so that a date which used to be readable -
    //       for example "Tue, 11 Aug 2026 04:19:04 GMT" - is not lost. Guessing comes last, so a date which starts
    //       with the day was already understood as the day it really is.
    const guessedDate = moment(trimmedDateText);

    return guessedDate.isValid() ? guessedDate : null;
}
