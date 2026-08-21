/**
 * Whether a value can be used as an absolute redirect destination.
 */
export function isAbsoluteUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}
