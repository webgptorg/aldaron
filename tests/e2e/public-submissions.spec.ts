import { createE2eTestEmail } from '@/lib/e2e/testData';
import { expect, test } from '@playwright/test';
import { submitAndExpectApiSuccess } from './support/submissions';

test.describe.configure({ mode: 'serial' });

test('submits the shared footer newsletter form', async ({ page }) => {
    await page.goto('/en');

    const newsletterForm = page.locator('footer form');
    await newsletterForm.locator('input[type="email"]').fill(createE2eTestEmail('footer-newsletter'));
    await newsletterForm.getByRole('checkbox').click();

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        newsletterForm.getByRole('button', { name: 'Subscribe' }).click(),
    );

    await expect(newsletterForm.getByText('Successfully subscribed!')).toBeVisible();
});

test('submits the reusable get-started lead dialog', async ({ page }) => {
    await page.goto('/old?modal=get-started&plan=enterprise');

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Contact Sales' })).toBeVisible();
    await dialog.locator('input[type="email"]').fill(createE2eTestEmail('generic-get-started'));

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Request a callback' }).click(),
    );

    await expect(dialog.getByText('Thanks, we will be in touch!')).toBeVisible();
});

test('submits the business lead dialog', async ({ page }) => {
    await page.goto('/ai-supervize?modal=get-started');

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Domluvme první krok k AI Supervizi' })).toBeVisible();
    await dialog.locator('input[type="email"]').fill(createE2eTestEmail('business-lead'));

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Domluvit první krok' }).click(),
    );

    await expect(dialog.getByText('Poptávka odeslána!')).toBeVisible();
});

test('submits the homepage qualification lead flow', async ({ page }) => {
    await page.goto('/cs');
    await page.locator('#hero-cta').click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Výroba / Průmysl' }).click();
    await expect(dialog.getByText('Co vás nejvíc trápí?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Lidé tráví hodiny hledáním dokumentů' }).click();
    await expect(dialog.getByText('Kdy byste chtěli začít?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Příští kvartál' }).click();
    await expect(dialog.getByText('Kam se vám ozveme?')).toBeVisible();

    await dialog.getByPlaceholder('Jan Novák').fill('E2E Qualification');
    await dialog.getByPlaceholder('Název vaší firmy').fill('E2E Example s.r.o.');
    await dialog.getByPlaceholder('jan@firma.cz').fill(createE2eTestEmail('qualification'));
    await dialog.getByPlaceholder('+420 777 123 456').fill('+420 777 000 001');

    const thankYouNavigation = page.waitForURL(/\/dekujeme\?/);
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Rezervovat hovor zdarma' }).click(),
    );
    await thankYouNavigation;
    await expect(page).toHaveURL(/\/dekujeme\?/);
});

test('submits the AI Ta Krajta subscription form', async ({ page }) => {
    await page.goto('/ai-ta-krajta');

    const email = page.locator('#ai-ta-krajta-email');
    const subscriptionForm = email.locator('xpath=ancestor::form');
    await email.fill(createE2eTestEmail('ai-ta-krajta'));

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        subscriptionForm.getByRole('button', { name: 'Chci vědět o novém dílu' }).click(),
    );

    await expect(page.getByRole('heading', { name: 'Hotovo, jsi v obraze' })).toBeVisible();
});

test('submits Pavol’s personal contact form', async ({ page }) => {
    await page.goto('/cs/pavol');

    const contactForm = page.locator('#contact form');
    await contactForm.locator('input').nth(0).fill('E2E Pavol');
    await contactForm.locator('input[type="email"]').fill(createE2eTestEmail('pavol-contact'));
    await contactForm.locator('input').nth(2).fill('E2E Example s.r.o.');
    await contactForm.locator('textarea').fill('E2E contact submission.');

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        contactForm.getByRole('button', { name: /Odeslat zprávu/ }).click(),
    );

    await expect(page.getByRole('heading', { name: 'Děkuji, zpráva je odeslaná' })).toBeVisible();
});

test('submits a published online-workshop registration', async ({ page }) => {
    await page.goto('/cs/online-workshop');

    const registrationForm = page.locator('#registrace form').first();
    if ((await registrationForm.count()) === 0) {
        test.skip(true, 'The configured database has no published future online workshop available for registration.');
    }

    await registrationForm.locator('input[name="fullname"]').fill('E2E Online Workshop');
    await registrationForm.locator('input[name="email"]').fill(createE2eTestEmail('online-workshop-registration'));
    await registrationForm.locator('input[name="phone"]').fill('+420 777 000 002');

    const thankYouNavigation = page.waitForURL(/\/cs\/online-workshop\/dekujeme/);
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        registrationForm.getByRole('button', { name: 'Rezervovat místo zdarma' }).click(),
    );
    await thankYouNavigation;
    await expect(page).toHaveURL(/\/cs\/online-workshop\/dekujeme/);
});

test('submits an available AI Supervize Mini workshop registration', async ({ page }) => {
    await page.goto('/ai-supervize-mini');

    const registrationForm = page
        .getByRole('heading', { name: 'Vyberte termín a formát' })
        .locator('xpath=ancestor::form');
    const availableDate = registrationForm
        .locator('button[type="button"]')
        .filter({ hasText: /Zbývá [1-9]\d* míst z/ })
        .first();

    if ((await availableDate.count()) === 0) {
        test.skip(true, 'The configured database has no AI Supervize Mini seats available for a live registration.');
    }

    await availableDate.click();
    await registrationForm.getByLabel('Jméno a příjmení').fill('E2E Workshop');
    await registrationForm.getByLabel('E-mail').fill(createE2eTestEmail('ai-supervize-mini-registration'));
    await registrationForm.getByLabel('Firma / organizace').fill('E2E Example s.r.o.');
    await registrationForm.getByLabel('Fakturační údaje').fill('E2E Example s.r.o., IČO 00000000');

    await submitAndExpectApiSuccess(page, '/api/ai-supervize-mini/registration', () =>
        registrationForm.getByRole('button', { name: 'Rezervovat workshop' }).click(),
    );

    await expect(page.getByRole('heading', { name: 'Přihláška je odeslaná' })).toBeVisible();
});

test('submits the AI Supervize Mini future-term interest form', async ({ page }) => {
    await page.goto('/ai-supervize-mini');
    await page
        .getByRole('button', { name: 'Nemůžu se zúčastnit, ale mám zájem o další termíny nebo jiný formát' })
        .click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox').first().click();
    await dialog.locator('#interest-fullname').fill('E2E Interest');
    await dialog.locator('#interest-email').fill(createE2eTestEmail('ai-supervize-mini-interest'));
    await dialog.locator('#interest-company').fill('E2E Example s.r.o.');

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Odeslat odpověď' }).click(),
    );

    await expect(dialog.getByRole('heading', { name: 'Děkujeme za zájem' })).toBeVisible();
});

test('connects a public online-workshop participant', async ({ page }) => {
    await page.goto('/cs/online-workshop/participant');

    const fullname = page.locator('#participant-fullname');
    if ((await fullname.count()) === 0) {
        test.skip(
            true,
            'The configured database has no published workshop room available for participant registration.',
        );
    }

    const connectionForm = fullname.locator('xpath=ancestor::form');
    await fullname.fill('E2E Participant');
    await page.locator('#participant-email').fill(createE2eTestEmail('workshop-participant'));

    await submitAndExpectApiSuccess(page, /\/api\/workshops\/[^/]+\/connect$/, () =>
        connectionForm.getByRole('button', { name: /Připojit/ }).click(),
    );
});
