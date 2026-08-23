import { expect, test } from '@playwright/test';

const PUBLIC_PAGE_CASES = [
    { path: '/cs', marker: 'Promptbook' },
    { path: '/en', marker: 'Promptbook' },
    { path: '/ai-supervize', marker: 'AI Supervize' },
    { path: '/ai-supervize-mini', marker: 'AI Supervize Mini' },
    { path: '/ai-ta-krajta', marker: 'AI ta Krajta' },
    { path: '/for-agro', marker: 'agronom' },
    { path: '/for-industry', marker: 'Promptbook' },
    { path: '/hackathon-factory', marker: 'Hackathon' },
    { path: '/pro-mesta', marker: 'měst' },
    { path: '/contact', marker: 'Meet Our Team' },
    { path: '/cs/pavol', marker: 'Pavol Hejný' },
    { path: '/en/pavol', marker: 'Pavol Hejný' },
    { path: '/cs/online-workshop', marker: 'Vyber si termín' },
    { path: '/cs/online-workshop/dekujeme?workshop=e2e-online-workshop', marker: 'E2E Online Workshop' },
    { path: '/cs/online-workshop/participant?workshop=e2e-online-workshop', marker: 'E2E Online Workshop' },
    { path: '/cs/komunita', marker: 'E2E Promptbook Community' },
    { path: '/branding', marker: 'Branding' },
    { path: '/data-deletion', marker: 'Data Deletion' },
    { path: '/cs/obchodni-podminky', marker: 'Obchodní podmínky' },
    { path: '/cs/ochrana-osobnich-udaju', marker: 'osobních údajů' },
    { path: '/en/terms-and-conditions', marker: 'Terms and Conditions' },
    { path: '/en/privacy-policy', marker: 'Privacy Policy' },
    { path: '/old', marker: 'Promptbook' },
    { path: '/dekujeme?name=Test&email=test@example.com', marker: 'Výborně, Test!' },
] as const;

for (const pageCase of PUBLIC_PAGE_CASES) {
    test(`loads public page ${pageCase.path}`, async ({ page }) => {
        const response = await page.goto(pageCase.path, { waitUntil: 'domcontentloaded' });

        expect(response?.status(), `Unexpected response for ${pageCase.path}`).toBe(200);
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(pageCase.marker);
    });
}

test('redirects the language-neutral homepage from Accept-Language', async ({ request }) => {
    const response = await request.get('/', {
        headers: { 'Accept-Language': 'cs-CZ,cs;q=0.9' },
        maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/cs');
});

test('redirects the language-neutral Pavol page from Accept-Language', async ({ request }) => {
    const response = await request.get('/pavol', {
        headers: { 'Accept-Language': 'cs-CZ,cs;q=0.9' },
        maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/cs/pavol');
});

const LEGACY_PUBLIC_REDIRECT_CASES = [
    { path: '/pro-firmy', status: 301, destination: '/cs' },
    { path: '/skoleni', status: 308, destination: '/ai-supervize-mini' },
    { path: '/privacy', status: 307, destination: '/cs/ochrana-osobnich-udaju' },
    { path: '/terms', status: 307, destination: '/cs/obchodni-podminky' },
] as const;

for (const redirectCase of LEGACY_PUBLIC_REDIRECT_CASES) {
    test(`redirects legacy public page ${redirectCase.path}`, async ({ request }) => {
        const response = await request.get(redirectCase.path, {
            headers: { 'Accept-Language': 'cs-CZ,cs;q=0.9' },
            maxRedirects: 0,
        });

        expect(response.status()).toBe(redirectCase.status);
        expect(new URL(response.headers().location ?? '', 'http://localhost:4009').pathname).toBe(
            redirectCase.destination,
        );
    });
}
