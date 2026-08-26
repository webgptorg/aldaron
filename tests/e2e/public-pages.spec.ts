import { expect, test } from '@playwright/test';

const PUBLIC_PAGE_PATHS = [
    '/',
    '/cs',
    '/en',
    '/pro-mesta',
    '/for-agro',
    '/for-industry',
    '/ai-supervize',
    '/ai-supervize-mini',
    '/ai-ta-krajta',
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

test('public landing and information pages load', async ({ page }) => {
    // In development Next.js compiles each public route on first visit. Keep
    // the smoke test broad without making a cold local run look like a fault.
    test.setTimeout(180_000);

    for (const path of PUBLIC_PAGE_PATHS) {
        await test.step(path, async () => {
            const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

            expect(response, `Expected ${path} to produce a document response`).not.toBeNull();
            expect(response!.ok(), `Expected ${path} to load without a server error`).toBeTruthy();
            await expect(
                page.locator('main, h1, footer').first(),
                `Expected ${path} to render visible page content`,
            ).toBeVisible();
        });
    }
});
