import { NextRequest, NextResponse } from 'next/server';

/**
 * A browser which sent a form has to be told to open another page, otherwise it would send the form again on a reload
 */
const SEE_OTHER_STATUS = 303;

/**
 * Answer a sent form of the administration by the page which the browser opens next
 */
export function redirectAfterAdminForm(request: NextRequest, path: string): NextResponse {
    const response = NextResponse.redirect(new URL(path, request.nextUrl.origin), SEE_OTHER_STATUS);
    response.headers.set('Cache-Control', 'no-store');

    return response;
}
