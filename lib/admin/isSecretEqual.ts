import { createHash, timingSafeEqual } from 'node:crypto';

function hashSecret(secret: string): Buffer {
    return createHash('sha256').update(secret, 'utf8').digest();
}

/**
 * Compares two secrets without leaking through the time the comparison takes
 *
 * Note: Both sides are hashed first, so the comparison always runs over the same amount of bytes and a difference in
 *       the length of the secrets stays hidden as well
 */
export function isSecretEqual(secret: string | null | undefined, expectedSecret: string | null | undefined): boolean {
    if (!secret || !expectedSecret) {
        return false;
    }

    return timingSafeEqual(hashSecret(secret), hashSecret(expectedSecret));
}
