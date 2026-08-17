import { NextRequest, NextResponse } from 'next/server';

/**
 * Protect cookie-authenticated mutations from cross-site form and fetch requests.
 * Requests without browser fetch metadata are left available to trusted API clients.
 */
export function getCrossSiteResponseOrNull(request: NextRequest): NextResponse | null {
    const fetchSite = request.headers.get('sec-fetch-site');
    const origin = request.headers.get('origin');
    const isCrossSite = fetchSite === 'cross-site' || (origin !== null && origin !== request.nextUrl.origin);

    return isCrossSite ? NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 }) : null;
}
