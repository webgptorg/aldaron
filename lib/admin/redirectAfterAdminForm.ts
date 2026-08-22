import { NextResponse } from 'next/server';

/**
 * A browser which sent a form has to be told to open another page, otherwise it would send the form again on a reload
 */
const SEE_OTHER_STATUS = 303;

/**
 * Answer a sent form of the administration by the page which the browser opens next
 */
export function redirectAfterAdminForm(path: string): NextResponse {
    // Keep the redirect relative to the URL the browser used. The public host can be different from the internal URL
    // which a development or deployment proxy gives Next.js.
    const response = new NextResponse(null, { status: SEE_OTHER_STATUS, headers: { Location: path } });
    response.headers.set('Cache-Control', 'no-store');

    return response;
}
