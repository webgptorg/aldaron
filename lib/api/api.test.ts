import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { isIpAddressValid, readClientIpAddress } from '@/lib/api/readClientIpAddress';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

/**
 * One request which carries just the given headers
 */
function createRequestWithHeaders(headers: Readonly<Record<string, string>>): Request {
    return new Request('http://localhost/api/waitlist', { method: 'POST', headers });
}

describe('reading the address of the visitor', () => {
    it('reads the address the proxy in front of the site wrote', () => {
        expect(readClientIpAddress(createRequestWithHeaders({ 'x-forwarded-for': '203.0.113.7' }))).toBe('203.0.113.7');
    });

    // Note: The header holds the whole chain "visitor, first proxy, second proxy", only its first entry is the visitor
    it('takes the visitor rather than one of the proxies it travelled through', () => {
        expect(
            readClientIpAddress(
                createRequestWithHeaders({ 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' }),
            ),
        ).toBe('203.0.113.7');
    });

    it('falls back to the address written by a proxy which knows only one header', () => {
        expect(readClientIpAddress(createRequestWithHeaders({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    });

    it('reads an address of the newer kind, whether it is written with a port or without one', () => {
        expect(readClientIpAddress(createRequestWithHeaders({ 'x-forwarded-for': '2001:db8::8a2e:370:7334' }))).toBe(
            '2001:db8::8a2e:370:7334',
        );
        expect(readClientIpAddress(createRequestWithHeaders({ 'x-forwarded-for': '[::1]:4009' }))).toBe('::1');
    });

    it('tells no address at all when there is none to be read', () => {
        expect(readClientIpAddress(createRequestWithHeaders({}))).toBeNull();
        expect(readClientIpAddress(createRequestWithHeaders({ 'x-forwarded-for': 'unknown' }))).toBeNull();
        expect(readClientIpAddress(createRequestWithHeaders({ 'x-forwarded-for': '' }))).toBeNull();
    });

    // Note: The database stores the address in an `inet` column, which refuses anything else with an error, so an
    //       address which cannot be understood must never reach it
    it('refuses what only looks like an address', () => {
        expect(isIpAddressValid('203.0.113.7')).toBe(true);
        expect(isIpAddressValid('::1')).toBe(true);
        expect(isIpAddressValid('203.0.113.256')).toBe(false);
        expect(isIpAddressValid('203.0.113')).toBe(false);
        expect(isIpAddressValid('203.0.113.7\'; DROP TABLE "Contact"; --')).toBe(false);
    });
});

describe('reading the body of a request', () => {
    it('reads an object of named fields', async () => {
        const body = await readJsonObjectOrNull(
            new Request('http://localhost/api/waitlist', { method: 'POST', body: JSON.stringify({ email: 'a@b.cz' }) }),
        );

        expect(body).toEqual({ email: 'a@b.cz' });
    });

    // Note: Anything which is not an object of named fields is refused here, so that it never reaches a database query
    for (const [description, body] of [
        ['is not JSON at all', 'not json'],
        ['is a list', '[{"email":"a@b.cz"}]'],
        ['is a bare value', '"a@b.cz"'],
        ['is nothing', 'null'],
    ] as const) {
        it(`tells nothing about a body which ${description}`, async () => {
            expect(
                await readJsonObjectOrNull(new Request('http://localhost/api/waitlist', { method: 'POST', body })),
            ).toBeNull();
        });
    }
});

describe('cookie-authenticated mutation origin checks', () => {
    it('accepts a mutation from the application itself', () => {
        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments', {
            headers: { origin: 'https://promptbook.studio', 'sec-fetch-site': 'same-origin' },
        });

        expect(getCrossSiteResponseOrNull(request)).toBeNull();
    });

    it('refuses a cross-site browser request', () => {
        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments', {
            headers: { origin: 'https://attacker.example', 'sec-fetch-site': 'cross-site' },
        });

        expect(getCrossSiteResponseOrNull(request)?.status).toBe(403);
    });

    it('keeps non-browser API clients available when they send no browser metadata', () => {
        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments');

        expect(getCrossSiteResponseOrNull(request)).toBeNull();
    });
});
