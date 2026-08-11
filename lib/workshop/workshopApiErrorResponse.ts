import { getErrorStatusCode } from '@/lib/workshop/workshopApiError';
import { NextResponse } from 'next/server';

/**
 * Turn any error thrown while serving the workshop into the answer the browser gets
 *
 * Note: Every workshop endpoint ends with this one translation, so a failure is reported the same way everywhere.
 */
export function createWorkshopApiErrorResponse(error: unknown): NextResponse {
    const statusCode = getErrorStatusCode(error);
    const message = error instanceof Error ? error.message : 'The workshop api failed';

    if (statusCode >= 500) {
        console.error('Workshop api error:', error);
    }

    return NextResponse.json({ error: message }, { status: statusCode });
}
