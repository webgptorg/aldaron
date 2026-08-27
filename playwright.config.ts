import 'dotenv/config';
import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009';
const usesExternalServer = process.env.E2E_BASE_URL !== undefined;
const usesIsolatedInMemorySupabase = !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

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
              // The test server exercises the public API without running or repairing
              // migrations as a side effect.
              // Without a service role key, the same endpoints use an isolated in-memory
              // store so local verification does not depend on a private credential.
              // It also keeps every route it compiled for the whole run, so that a route
              // is never disposed and rebuilt underneath a later test.
              // Next does not replace explicitly empty environment values from .env.
              env: {
                  ...process.env,
                  DATABASE_URL: '',
                  E2E_IN_MEMORY_SUPABASE: usesIsolatedInMemorySupabase ? 'true' : '',
                  E2E_KEEP_COMPILED_ROUTES: 'true',
              },
          },
});
