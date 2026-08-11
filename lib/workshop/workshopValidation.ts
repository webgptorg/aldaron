import { WORKSHOP_REACTION_EMOJIS, type WorkshopReactionEmoji } from '@/lib/workshop/workshopConfig';
import { createWorkshopApiError } from '@/lib/workshop/workshopApiError';

/**
 * Read a text sent by a participant or by the administration
 *
 * Note: The surrounding whitespace goes away and the length is cut, so neither an accidental newline nor a very long
 *       paste can reach the database.
 */
export function readText(value: unknown, maximalLength: number): string {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().slice(0, maximalLength);
}

/**
 * Read a text which must not be empty
 *
 * @throws When the value is missing, so that the api answers "bad request" instead of storing an empty row
 */
export function readRequiredText(value: unknown, maximalLength: number, fieldName: string): string {
    const text = readText(value, maximalLength);

    if (text === '') {
        throw createWorkshopApiError(`The field \`${fieldName}\` must not be empty`, 400);
    }

    return text;
}

/**
 * Read a moment sent as a text, `null` when it is not filled in
 *
 * @throws When the value is filled in but is not a date
 */
export function readOptionalDateTime(value: unknown, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value !== 'string') {
        throw createWorkshopApiError(`The field \`${fieldName}\` must be a date written as a text`, 400);
    }

    const dateTime = new Date(value);

    if (Number.isNaN(dateTime.getTime())) {
        throw createWorkshopApiError(`The field \`${fieldName}\` is not a valid date`, 400);
    }

    return dateTime.toISOString();
}

/**
 * Read a moment which must be filled in
 */
export function readRequiredDateTime(value: unknown, fieldName: string): string {
    const dateTime = readOptionalDateTime(value, fieldName);

    if (dateTime === null) {
        throw createWorkshopApiError(`The field \`${fieldName}\` must be filled in`, 400);
    }

    return dateTime;
}

/**
 * Read a yes or no answer, `undefined` when it was not sent at all
 */
export function readOptionalBoolean(value: unknown, fieldName: string): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== 'boolean') {
        throw createWorkshopApiError(`The field \`${fieldName}\` must be true or false`, 400);
    }

    return value;
}

/**
 * Read a whole number, `undefined` when it was not sent at all
 */
export function readOptionalNumber(value: unknown, fieldName: string): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        throw createWorkshopApiError(`The field \`${fieldName}\` must be a number`, 400);
    }

    return Math.round(numberValue);
}

/**
 * Read an identifier of a database row sent by the browser
 */
export function readRowId(value: unknown): number {
    const rowId = Number(value);

    if (!Number.isInteger(rowId) || rowId <= 0) {
        throw createWorkshopApiError('The field `id` must be an identifier of an existing row', 400);
    }

    return rowId;
}

/**
 * Whether the value is one of the reactions a participant may send
 */
export function isReactionEmojiSupported(value: unknown): value is WorkshopReactionEmoji {
    return WORKSHOP_REACTION_EMOJIS.some((reactionEmoji) => reactionEmoji === value);
}

/**
 * Read a reaction sent by a participant
 *
 * @throws When the reaction is not one of the offered ones, so that nothing else can travel through this endpoint
 */
export function readReactionEmoji(value: unknown): WorkshopReactionEmoji {
    if (!isReactionEmojiSupported(value)) {
        throw createWorkshopApiError('The field `reactionEmoji` must be one of the offered reactions', 400);
    }

    return value;
}
