import { createRequestSiteUrl } from '@/lib/api/createRequestSiteUrl';
import { SITE_URL } from '@/lib/metadata/site-config';
import type { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const COMMUNITY_PATH = '/cs/komunita';

function createRequest(url: string): NextRequest {
    return { nextUrl: new URL(url) } as NextRequest;
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('request site url', () => {
    it('returns a browser to the canonical address of the site in production', () => {
        vi.stubEnv('NODE_ENV', 'production');

        expect(createRequestSiteUrl(createRequest('https://forged.example.com/cs/komunita'), COMMUNITY_PATH)).toBe(
            `${SITE_URL}${COMMUNITY_PATH}`,
        );
    });

    it('returns a browser to the development server which was really reached', () => {
        vi.stubEnv('NODE_ENV', 'development');

        expect(createRequestSiteUrl(createRequest('http://127.0.0.1:4009/cs/komunita'), COMMUNITY_PATH)).toBe(
            `http://127.0.0.1:4009${COMMUNITY_PATH}`,
        );
    });
});
