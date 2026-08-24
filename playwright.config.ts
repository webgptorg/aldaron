import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009';
const usesExternalServer = process.env.E2E_BASE_URL !== undefined;

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/e2e/.artifacts',
    fullyParallel: false,
    workers: 1,
    timeout: 45_000,
    expect: {
        timeout: 10_000,
    },
    reporter: 'list',
    globalTeardown: './tests/e2e/globalTeardown.ts',
    use: {
        baseURL,
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1280, height: 720 } },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    webServer: usesExternalServer
        ? undefined
        : {
              command: 'npx next dev -p 4009',
              url: baseURL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
              // The test server exercises an already-configured database through the
              // public API. It must not run or repair migrations as a side effect.
              // Next does not replace an explicitly empty environment value from .env.
              env: { ...process.env, DATABASE_URL: '' },
          },
});
