import { DISCOUNT_CODE_QUERY_PARAMETER, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { AI_SUPERVIZE_MINI_PATH, createDiscountCodePrefillPath } from '@/lib/discounts/discountPlaces';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Every public address which renders a page of its own.
 */
const PUBLIC_PAGE_PATHS = [
    '/cs',
    '/en',
    '/pro-mesta',
    '/for-agro',
    '/for-industry',
    '/ai-supervize',
    AI_SUPERVIZE_MINI_PATH,
    '/hackathon-factory',
    '/cs/online-workshop',
    '/cs/komunita/clenstvi',
    '/cs/pavol',
    '/en/pavol',
    '/cs/ochrana-osobnich-udaju',
    '/en/privacy-policy',
    '/cs/obchodni-podminky',
    '/en/terms-and-conditions',
    '/contact',
    '/branding',
    '/data-deletion',
    '/old',
] as const;

type PublicPagePath = (typeof PUBLIC_PAGE_PATHS)[number];

/**
 * The address which used to hold the training and now only forwards to the workshop it became
 */
const RETIRED_TRAINING_PATH = '/skoleni';

/**
 * A public address which renders nothing itself and only forwards to a page of this suite.
 *
 * Note: A route reading `Accept-Language` may pick any of its localized destinations, so every one of them is
 *       accepted and every one of them is rendered by its own page check above.
 */
type PublicRedirect = {
    readonly path: string;
    readonly statusCode: number;
    readonly destinationPaths: readonly PublicPagePath[];
};

const PERMANENT_REDIRECT_STATUS_CODE = 308;
const TEMPORARY_REDIRECT_STATUS_CODE = 307;

const PUBLIC_REDIRECTS: readonly PublicRedirect[] = [
    { path: '/', statusCode: TEMPORARY_REDIRECT_STATUS_CODE, destinationPaths: ['/cs', '/en'] },
    { path: '/pavol', statusCode: TEMPORARY_REDIRECT_STATUS_CODE, destinationPaths: ['/cs/pavol', '/en/pavol'] },
    {
        path: '/privacy',
        statusCode: TEMPORARY_REDIRECT_STATUS_CODE,
        destinationPaths: ['/cs/ochrana-osobnich-udaju', '/en/privacy-policy'],
    },
    {
        path: '/terms',
        statusCode: TEMPORARY_REDIRECT_STATUS_CODE,
        destinationPaths: ['/cs/obchodni-podminky', '/en/terms-and-conditions'],
    },
    {
        path: RETIRED_TRAINING_PATH,
        statusCode: PERMANENT_REDIRECT_STATUS_CODE,
        destinationPaths: [AI_SUPERVIZE_MINI_PATH],
    },
];

const E2E_DISCOUNT_CODE = 'E2E SLEVA';

const PUBLIC_PAGE_TEST_TIMEOUT_MS = 180_000;

async function expectPublicPageToLoad(page: Page, path: PublicPagePath): Promise<void> {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

    expect(response, `Expected ${path} to produce a document response`).not.toBeNull();
    expect(response!.ok(), `Expected ${path} to load without a server error`).toBeTruthy();
    await expect(
        page.locator('main, h1, footer').first(),
        `Expected ${path} to render visible page content`,
    ).toBeVisible();
}

/**
 * Reads where a redirect points, whether it answers with an absolute or a site-relative `Location`.
 */
function readRedirectDestinationPath(locationHeader: string, requestUrl: string): string {
    const destinationUrl = new URL(locationHeader, requestUrl);

    return `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
}

/**
 * Asks a redirecting address where it points without following it, so the destination is rendered once by the page
 * check which owns it instead of a second time through every address leading to it.
 */
async function readRedirectDestination(
    request: APIRequestContext,
    path: string,
    expectedStatusCode: number,
): Promise<string> {
    const response = await request.get(path, { maxRedirects: 0 });

    expect(response.status(), `Expected ${path} to answer with status ${expectedStatusCode}`).toBe(expectedStatusCode);

    const locationHeader = response.headers()['location'];
    expect(locationHeader, `Expected ${path} to name where it redirects`).toBeDefined();

    return readRedirectDestinationPath(locationHeader, response.url());
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

for (const publicRedirect of PUBLIC_REDIRECTS) {
    test(`public address redirects to its page: ${publicRedirect.path}`, async ({ request }) => {
        test.setTimeout(PUBLIC_PAGE_TEST_TIMEOUT_MS);

        const destinationPath = await readRedirectDestination(request, publicRedirect.path, publicRedirect.statusCode);

        expect(
            publicRedirect.destinationPaths.some((candidatePath) => candidatePath === destinationPath),
            `Expected ${publicRedirect.path} to redirect to ${publicRedirect.destinationPaths.join(
                ' or ',
            )}, but it pointed at ${destinationPath}`,
        ).toBeTruthy();
    });
}

test(`${RETIRED_TRAINING_PATH} carries a discount code to the workshop registration`, async ({ request }) => {
    test.setTimeout(PUBLIC_PAGE_TEST_TIMEOUT_MS);

    const destinationPath = await readRedirectDestination(
        request,
        `${RETIRED_TRAINING_PATH}?${DISCOUNT_CODE_QUERY_PARAMETER}=${encodeURIComponent(E2E_DISCOUNT_CODE)}`,
        PERMANENT_REDIRECT_STATUS_CODE,
    );

    expect(destinationPath, `Expected ${RETIRED_TRAINING_PATH} to pre-fill the discount code it was given`).toBe(
        createDiscountCodePrefillPath(AI_SUPERVIZE_MINI_PATH, REGISTRATION_SECTION_ID, E2E_DISCOUNT_CODE),
    );
});
