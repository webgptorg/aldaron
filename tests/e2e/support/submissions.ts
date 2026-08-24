import { expect, type Page } from '@playwright/test';

type ApiPath = string | RegExp;

function isMatchingApiPath(pathname: string, apiPath: ApiPath): boolean {
    return typeof apiPath === 'string' ? pathname === apiPath : apiPath.test(pathname);
}

/**
 * Submit a public form and assert that its real server endpoint accepted the
 * request. This intentionally does not mock the database-facing request.
 */
export async function submitAndExpectApiSuccess(
    page: Page,
    apiPath: ApiPath,
    submit: () => Promise<void>,
): Promise<void> {
    const responsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === 'POST' && isMatchingApiPath(new URL(response.url()).pathname, apiPath),
    );

    await submit();

    const response = await responsePromise;
    expect(response.ok(), `Expected ${response.url()} to accept the submitted form`).toBeTruthy();
}
