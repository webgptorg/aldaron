import { createWorkshopSessionToken, hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';
import { describe, expect, it } from 'vitest';

describe('workshop participant sessions', () => {
    it('creates independent high-entropy URL-safe tokens', () => {
        const firstToken = createWorkshopSessionToken();
        const secondToken = createWorkshopSessionToken();

        expect(firstToken).not.toBe(secondToken);
        expect(firstToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it('stores only a deterministic SHA-256 hash', () => {
        const sessionToken = 'participant-session-token';
        const sessionHash = hashWorkshopSessionToken(sessionToken);

        expect(sessionHash).toHaveLength(64);
        expect(sessionHash).toMatch(/^[a-f0-9]+$/);
        expect(sessionHash).not.toContain(sessionToken);
        expect(hashWorkshopSessionToken(sessionToken)).toBe(sessionHash);
    });
});
