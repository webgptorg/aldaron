import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4009';
const OUT_DIR = 'test-results/unslop-ai-supervize-mini';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

page.on('console', (message) => {
    if (message.type() === 'error') {
        console.log('CONSOLE ERROR:', message.text());
    }
});

await page.goto(`${BASE_URL}/ai-supervize-mini`, { waitUntil: 'networkidle', timeout: 180000 });
await page.waitForTimeout(2500);

console.log('H1:', (await page.locator('h1').first().innerText()).replace(/\n/g, ' '));
console.log('HEADER:', (await page.locator('header').first().innerText()).replace(/\n/g, ' | '));

await page.screenshot({ path: `${OUT_DIR}/full.png`, fullPage: true });

const sections = ['hero', 'registration', 'faq', 'testimonials', 'author'];
const offsets = [0, 1, 2, 3, 4];
for (const index of offsets) {
    await page.evaluate((i) => window.scrollTo(0, i * 950), index);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT_DIR}/${index}-${sections[index]}.png` });
}

// Open every FAQ answer so the rewritten answers are visible in one shot.
await page.evaluate(() => window.scrollTo(0, 0));
const faqButtons = page.locator('button:has-text("?")');
const faqCount = await faqButtons.count();
console.log('FAQ toggles found:', faqCount);
for (let i = 0; i < faqCount; i++) {
    await faqButtons.nth(i).click({ timeout: 5000 }).catch(() => {});
}
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/faq-open.png`, fullPage: true });

// The interest dialog copy.
await page
    .getByRole('button', { name: 'Nemůžu se zúčastnit, ale mám zájem o další termíny nebo jiný formát' })
    .click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT_DIR}/interest-dialog.png` });

await browser.close();
console.log('DONE');
