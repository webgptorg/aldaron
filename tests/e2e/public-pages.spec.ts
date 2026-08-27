import { expect, test, type Page } from '@playwright/test';

const PUBLIC_PAGE_PATHS = [
    '/',
    '/cs',
    '/en',
    '/pro-mesta',
    '/for-agro',
    '/for-industry',
    '/ai-supervize',
    '/ai-supervize-mini',
    '/hackathon-factory',
    '/cs/online-workshop',
    '/cs/komunita/clenstvi',
    '/cs/pavol',
    '/en/pavol',
    '/pavol',
    '/contact',
    '/branding',
    '/privacy',
    '/terms',
    '/data-deletion',
    '/old',
    '/skoleni',
] as const;

const PUBLIC_PAGE_TEST_TIMEOUT_MS = 180_000;

type PublicPagePath = (typeof PUBLIC_PAGE_PATHS)[number];

async function expectPublicPageToLoad(page: Page, path: PublicPagePath): Promise<void> {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

    expect(response, `Expected ${path} to produce a document response`).not.toBeNull();
    expect(response!.ok(), `Expected ${path} to load without a server error`).toBeTruthy();
    await expect(
        page.locator('main, h1, footer').first(),
        `Expected ${path} to render visible page content`,
    ).toBeVisible();
}

for (const path of PUBLIC_PAGE_PATHS) {
    test(`public landing and information page loads: ${path}`, async ({ page }) => {
        // Next.js compiles a route on its first dev-server visit. Isolating
        // every route keeps earlier cold compilations from exhausting the
        // timeout of a healthy page later in the smoke suite.
        test.setTimeout(PUBLIC_PAGE_TEST_TIMEOUT_MS);

        await expectPublicPageToLoad(page, path);
    });
}
