import { NextRequest, NextResponse } from 'next/server';

/**
 * Protect cookie-authenticated mutations from cross-site form and fetch requests.
 * Requests without browser fetch metadata are left available to trusted API clients.
 */
export function getCrossSiteResponseOrNull(request: NextRequest): NextResponse | null {
    const fetchSite = request.headers.get('sec-fetch-site');
    const origin = request.headers.get('origin');
    const isSameOriginBrowserRequest = fetchSite === 'same-origin';

    // A reverse proxy may give Next.js an internal request URL while the browser correctly identifies its form as
    // same-origin. Browser fetch metadata is authoritative in that case; `same-site` deliberately still falls back to
    // the origin comparison because a sibling subdomain must not be able to spend this site's cookie.
    const isCrossSite =
        fetchSite === 'cross-site' ||
        (!isSameOriginBrowserRequest && origin !== null && origin !== request.nextUrl.origin);

    return isCrossSite ? NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 }) : null;
}
