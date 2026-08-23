import type { Page } from '@playwright/test';

export type CapturedJsonRequest = Readonly<Record<string, unknown>>;

export async function installWaitlistMock(page: Page): Promise<CapturedJsonRequest[]> {
    return installPostMock(page, '/api/waitlist', { success: true });
}

export async function installPostMock<ResponseBody extends object>(
    page: Page,
    pathname: string,
    responseBody: ResponseBody,
): Promise<CapturedJsonRequest[]> {
    const requests: CapturedJsonRequest[] = [];

    await page.route(`**${pathname}`, async (route) => {
        const requestBody = route.request().postData();
        requests.push(requestBody === null ? {} : (JSON.parse(requestBody) as CapturedJsonRequest));
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responseBody),
        });
    });

    return requests;
}
