import { z } from 'zod';

const SHORTCODE_LINK_ID_SCHEMA = z.coerce.number().int().positive();

/**
 * Reads a database identifier from a route segment or a shared administration link. Invalid values stay harmlessly
 * absent instead of being handed to the database.
 */
export function parseShortcodeLinkId(value: unknown): number | null {
    const parsedResult = SHORTCODE_LINK_ID_SCHEMA.safeParse(value);

    return parsedResult.success ? parsedResult.data : null;
}
