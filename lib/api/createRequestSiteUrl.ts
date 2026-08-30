import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { NextRequest } from 'next/server';

/**
 * Absolute address a browser is sent back to after leaving the site, for example from a payment gate.
 *
 * Note: A production server always returns to the canonical address of the site, so no header of a request can decide
 *       where a paying member ends up. A development server returns to whichever address it was reached at, because
 *       the canonical one does not resolve to it.
 */
export function createRequestSiteUrl(request: NextRequest, path: string): string {
    return process.env.NODE_ENV === 'production'
        ? createAbsoluteUrl(path)
        : new URL(path, request.nextUrl.origin).toString();
}
