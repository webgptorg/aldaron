import { defineConfig } from '@playwright/test';

const baseURL = 'http://localhost:4009';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        baseURL,
        storageState: './tests/e2e/support/storage-state.json',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'node tests/e2e/start-e2e-server.mjs',
        url: `${baseURL}/cs`,
        timeout: 120_000,
        reuseExistingServer: false,
    },
});
