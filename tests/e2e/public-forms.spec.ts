import { expect, test, type Page } from '@playwright/test';
import {
    E2E_COMMUNITY_SLUG,
    E2E_WORKSHOP_AVAILABILITIES,
    E2E_WORKSHOP_SLUG,
    createE2EWorkshopState,
} from './support/workshop-fixture';
import { installPostMock, installWaitlistMock } from './support/http-mocks';

async function expectOneSubmission(requests: readonly Readonly<Record<string, unknown>>[]) {
    await expect.poll(() => requests.length).toBe(1);
    return requests[0]!;
}

async function fillQualificationWizard(page: Page) {
    await page.locator('#hero-cta').click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Výroba / Průmysl', exact: true }).click();
    await dialog
        .getByRole('button', { name: 'Lidé tráví hodiny hledáním dokumentů', exact: true })
        .click();
    await dialog.getByRole('button', { name: 'Co nejdřív - řešíme to akutně', exact: true }).click();

    await dialog.getByPlaceholder('Jan Novák').fill('Jana Testovací');
    await dialog.getByPlaceholder('Název vaší firmy').fill('E2E Firma');
    await dialog.getByPlaceholder('jan@firma.cz').fill('jana.qualification@example.com');
    await dialog.getByPlaceholder('+420 777 123 456').fill('+420 777 123 456');
    await dialog.getByRole('button', { name: 'Rezervovat hovor zdarma', exact: true }).click();
}

test.describe('public form submissions', () => {
    test('submits the footer newsletter through the shared waitlist endpoint', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/cs');

        const form = page.locator('footer form');
        await form.locator('input[type="email"]').fill('footer.newsletter@example.com');
        await form.getByRole('checkbox').click();
        await form.getByRole('button', { name: 'Odebírat', exact: true }).click();

        await expect(page.getByText('Úspěšně přihlášeno!', { exact: true })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            email: 'footer.newsletter@example.com',
            placeName: 'newsletter-footer',
        });
    });

    test('submits the homepage qualification lead and reaches the thank-you page', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/cs');

        await fillQualificationWizard(page);

        await expect(page).toHaveURL(/\/dekujeme\?name=Jana\+Testovac%C3%AD/);
        await expect(page.getByRole('heading', { name: 'Výborně, Jana Testovací!' })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            fullname: 'Jana Testovací',
            email: 'jana.qualification@example.com',
            phone: '+420 777 123 456',
            placeName: 'qualification-popup',
        });
    });

    const BUSINESS_LEAD_CASES = [
        { name: 'AI Supervize', path: '/ai-supervize', placeName: 'AiSupervizePage' },
        { name: 'agronomy', path: '/for-agro', placeName: 'ForAgroPage' },
        { name: 'industry', path: '/for-industry', placeName: 'ForIndustryPage' },
        { name: 'Hackathon Factory', path: '/hackathon-factory', placeName: 'HackathonFactoryPage' },
        { name: 'cities', path: '/pro-mesta', placeName: 'ProMestaPage' },
    ] as const;

    for (const leadCase of BUSINESS_LEAD_CASES) {
        test(`submits a business get-started lead from the ${leadCase.name} modal`, async ({ page }) => {
            const requests = await installWaitlistMock(page);
            await page.goto(`${leadCase.path}?modal=get-started`);

            const dialog = page.getByRole('dialog');
            await dialog.locator('input[type="email"]').fill('business.lead@example.com');
            await dialog.locator('input[type="tel"]').fill('+420 777 000 000');
            await dialog.locator('form button[type="submit"]').click();

            await expect(dialog.locator('form')).toHaveCount(0);
            expect(await expectOneSubmission(requests)).toMatchObject({
                email: 'business.lead@example.com',
                phone: '+420 777 000 000',
                placeName: leadCase.placeName,
            });
        });
    }

    test('submits the legacy waitlist popup with the selected plan', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/old?modal=get-started&plan=enterprise');

        const dialog = page.getByRole('dialog');
        await dialog.getByPlaceholder('john@awesome-company.com').fill('legacy.lead@example.com');
        await dialog.getByRole('button', { name: 'Request a callback', exact: true }).click();

        await expect(dialog.getByText('Thanks, we will be in touch!', { exact: true })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            email: 'legacy.lead@example.com',
            placeName: 'HomePage',
            userNote: 'Selected plan: Enterprise',
        });
    });

    test('submits Pavol’s contact lead form', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/cs/pavol#contact');

        const form = page.locator('#contact form');
        await form.getByPlaceholder('Vaše jméno').fill('Pavol Lead Test');
        await form.getByPlaceholder('jmeno@firma.cz').fill('pavol.lead@example.com');
        await form.getByPlaceholder('Firma s.r.o.').fill('E2E Organizace');
        await form
            .getByPlaceholder('Popište stručně, co řešíte a s čím byste potřebovali pomoci.')
            .fill('Testovací zpráva z veřejného kontaktního formuláře.');
        await form.getByRole('button', { name: /Odeslat zprávu/ }).click();

        await expect(page.getByText('Děkuji, zpráva je odeslaná', { exact: true })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            fullname: 'Pavol Lead Test',
            email: 'pavol.lead@example.com',
            placeName: 'PavolPersonalPage-cs',
        });
    });

    test('submits the AI ta Krajta episode newsletter', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/ai-ta-krajta#odber');

        const form = page.locator('section#odber form');
        await form.getByLabel('E-mail', { exact: true }).fill('podcast.listener@example.com');
        await form.getByRole('button', { name: 'Chci vědět o novém dílu', exact: true }).click();

        await expect(page.getByRole('heading', { name: 'Hotovo, jsi v obraze' })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            email: 'podcast.listener@example.com',
            placeName: 'AiTaKrajtaSubscription',
        });
    });

    test('submits the AI Supervize Mini workshop registration', async ({ page }) => {
        const requests = await installPostMock(page, '/api/ai-supervize-mini/registration', {
            workshopAvailabilities: E2E_WORKSHOP_AVAILABILITIES,
            workshopPrice: { basePriceCzk: 12000, discountAmountCzk: 0, finalPriceCzk: 12000 },
        });
        await page.goto('/ai-supervize-mini#registrace');

        const form = page.locator('form').filter({ hasText: 'Vyberte termín a formát' });
        await form.getByLabel('Jméno a příjmení', { exact: true }).fill('Mini Workshop Test');
        await form.getByLabel('E-mail', { exact: true }).fill('mini.registration@example.com');
        await form.getByLabel('Firma / organizace', { exact: true }).fill('E2E Workshop s.r.o.');
        await form.getByLabel('Fakturační údaje', { exact: true }).fill('E2E Workshop s.r.o., IČO 12345678');
        await form.getByRole('button', { name: 'Rezervovat workshop', exact: true }).click();

        await expect(page.getByRole('heading', { name: 'Přihláška je odeslaná' })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            selectedDateId: '2026-09-04',
            participantCount: 1,
            fullname: 'Mini Workshop Test',
            email: 'mini.registration@example.com',
            company: 'E2E Workshop s.r.o.',
            invoiceType: 'company',
            billingDetails: 'E2E Workshop s.r.o., IČO 12345678',
            discountCode: '',
        });
    });

    test('submits the AI Supervize Mini interest lead', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/ai-supervize-mini#registrace');

        await page
            .getByRole('button', { name: /Nemůžu se zúčastnit, ale mám zájem/ })
            .click();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('checkbox').first().click();
        await dialog.getByLabel('Jméno a příjmení', { exact: true }).fill('Mini Interest Test');
        await dialog.getByLabel('E-mail', { exact: true }).fill('mini.interest@example.com');
        await dialog.getByLabel('Firma / organizace', { exact: true }).fill('E2E Interest s.r.o.');
        await dialog.getByRole('button', { name: 'Odeslat odpověď', exact: true }).click();

        await expect(dialog.getByRole('heading', { name: 'Děkujeme za zájem' })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            fullname: 'Mini Interest Test',
            email: 'mini.interest@example.com',
            placeName: 'AiSupervizeMiniWorkshopInterest',
        });
    });

    test('submits the online workshop registration and shows its confirmation', async ({ page }) => {
        const requests = await installWaitlistMock(page);
        await page.goto('/cs/online-workshop#registrace');

        const form = page.locator('section#registrace form');
        await form.getByLabel('Jméno', { exact: true }).fill('Online Workshop Test');
        await form.getByLabel('E-mail', { exact: true }).fill('online.registration@example.com');
        await form.getByLabel(/Telefon/).fill('+420 777 111 222');
        await form.getByRole('button', { name: 'Rezervovat místo zdarma', exact: true }).click();

        await expect(page).toHaveURL(/\/cs\/online-workshop\/dekujeme\?workshop=e2e-online-workshop/);
        await expect(page.getByRole('heading', { name: /E2E Online Workshop/ })).toBeVisible();
        expect(await expectOneSubmission(requests)).toMatchObject({
            fullname: 'Online Workshop Test',
            email: 'online.registration@example.com',
            phone: '+420 777 111 222',
            placeName: 'OnlineWorkshopRegistration',
        });
    });
});

const ROOM_CONNECTION_CASES = [
    {
        name: 'online workshop',
        path: `/cs/online-workshop/participant?workshop=${E2E_WORKSHOP_SLUG}&email=prefilled@example.com&fullname=Prefilled%20Visitor`,
        slug: E2E_WORKSHOP_SLUG,
        room: 'workshop' as const,
        submitLabel: 'Vstoupit do místnosti',
    },
    {
        name: 'Promptbook community',
        path: `/cs/komunita?email=prefilled@example.com&fullname=Prefilled%20Member`,
        slug: E2E_COMMUNITY_SLUG,
        room: 'community' as const,
        submitLabel: 'Vstoupit do komunity',
    },
] as const;

for (const roomCase of ROOM_CONNECTION_CASES) {
    test(`submits the ${roomCase.name} connection form`, async ({ page }) => {
        const connectionRequests = await installPostMock(
            page,
            `/api/workshops/${roomCase.slug}/connect`,
            { state: createE2EWorkshopState(roomCase.room, 'Room Connection Test', 'room.connection@example.com') },
        );
        await page.route(`**/api/workshops/${roomCase.slug}/state`, async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Workshop connection required' }),
            });
        });
        await page.goto(roomCase.path);

        const form = page.locator('form').filter({
            has: page.getByRole('button', { name: roomCase.submitLabel, exact: true }),
        });
        await expect(form.getByLabel('Jméno a příjmení', { exact: true })).toHaveValue(/Prefilled/);
        await form.getByLabel('Jméno a příjmení', { exact: true }).fill('Room Connection Test');
        await form.getByLabel('E-mail', { exact: true }).fill('room.connection@example.com');
        const acceptAllButton = page.getByRole('button', { name: 'Accept all', exact: true });
        if (await acceptAllButton.isVisible()) {
            await acceptAllButton.click();
        }
        await form.getByRole('button', { name: roomCase.submitLabel, exact: true }).click();

        await expect(form).toHaveCount(0);
        expect(await expectOneSubmission(connectionRequests)).toMatchObject({
            fullname: 'Room Connection Test',
            email: 'room.connection@example.com',
        });
    });
}
