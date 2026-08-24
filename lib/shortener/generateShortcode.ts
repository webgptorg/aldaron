const SHORTCODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_SHORTCODE_LENGTH = 8;

/**
 * Produces an unreserved shortcode candidate. Persistence still owns the
 * uniqueness check, so callers retry a collision instead of treating a random
 * string as a guaranteed address.
 */
export function generateShortcode(length = DEFAULT_SHORTCODE_LENGTH): string {
    const randomValues = new Uint32Array(length);
    globalThis.crypto.getRandomValues(randomValues);

    return Array.from(randomValues, (randomValue) => SHORTCODE_CHARACTERS[randomValue % SHORTCODE_CHARACTERS.length]).join(
        '',
    );
}
