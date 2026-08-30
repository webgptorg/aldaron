[x] by Claude Code `claude-opus-5` thinking `high` - Implementation $4.71 10 minutes; Testing 7 minutes

[✨🍘] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
[..., test output truncated to the last 12000 characters...]
   342 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       342 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                342 B         102 kB
├ ○ /branding                                                                              4.8 kB         141 kB
├ ○ /contact                                                                              2.54 kB         164 kB
├ ○ /cs                                                                                     173 B         240 kB
├ ƒ /cs/komunita                                                                            232 B         267 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.8 kB         150 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   342 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            342 B         102 kB
├ ƒ /cs/komunita/projects                                                                 1.96 kB         137 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     8.26 kB         253 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   10.1 kB         242 kB
├ ƒ /cs/online-workshop/dekujeme                                                          3.85 kB         151 kB
├ ○ /cs/online-workshop/opengraph-image                                                     342 B         102 kB
├ ƒ /cs/online-workshop/participant                                                        5.3 kB         250 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         342 B         102 kB
├ ○ /cs/opengraph-image                                                                     342 B         102 kB
├ ○ /cs/pavol                                                                               159 B         204 kB
├ ○ /cs/pavol/opengraph-image                                                               342 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             3.75 kB         151 kB
├ ○ /en                                                                                     172 B         240 kB
├ ○ /en/opengraph-image                                                                     342 B         102 kB
├ ○ /en/pavol                                                                               159 B         204 kB
├ ○ /en/pavol/opengraph-image                                                               342 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.51 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               342 B         102 kB
├ ○ /for-industry                                                                         8.04 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           342 B         102 kB
├ ○ /hackathon-factory                                                                    15.3 kB         253 kB
├ ○ /hackathon-factory/opengraph-image                                                      342 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               342 B         102 kB
├ ○ /manifest.webmanifest                                                                   342 B         102 kB
├ ○ /old                                                                                  17.8 kB         246 kB
├ ○ /opengraph-image                                                                        342 B         102 kB
├ ƒ /pavol                                                                                  342 B         102 kB
├ ƒ /privacy                                                                                342 B         102 kB
├ ƒ /pro-firmy                                                                              342 B         102 kB
├ ○ /pro-mesta                                                                            6.77 kB         268 kB
├ ○ /pro-mesta/opengraph-image                                                              342 B         102 kB
├ ○ /robots.txt                                                                             342 B         102 kB
├ ○ /shortener                                                                              342 B         102 kB
├ ○ /sitemap.xml                                                                            342 B         102 kB
├ ƒ /skoleni                                                                                342 B         102 kB
├ ƒ /terms                                                                                  342 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-6c8ee981b3c4cfc9.js                                                       45.8 kB
  ├ chunks/4bd1b696-56d776b9b579ad04.js                                                   53.3 kB
  └ other shared chunks (total)                                                           2.49 kB


ƒ Middleware                                                                                31 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 35 tests using 1 worker

  ✓   1 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: / (3.5s)
  ✓   2 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /cs (3.7s)
  ✓   3 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /en (2.0s)
  ✓   4 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /pro-mesta (2.9s)
  ✓   5 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /for-agro (2.5s)
  ✓   6 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /for-industry (2.7s)
  ✓   7 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /ai-supervize (8.3s)
  ✓   8 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /ai-supervize-mini (7.9s)
  ✓   9 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /ai-ta-krajta (5.7s)
  ✓  10 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /hackathon-factory (2.8s)
  ✓  11 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /cs/online-workshop (5.3s)
  ✓  12 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /cs/komunita/clenstvi (3.9s)
  ✓  13 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /cs/pavol (3.9s)
  ✓  14 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /en/pavol (3.7s)
  ✓  15 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /pavol (2.8s)
  ✓  16 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /contact (3.7s)
  ✓  17 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /branding (3.7s)
  ✓  18 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /privacy (4.8s)
  ✓  19 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /terms (4.4s)
  ✓  20 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /data-deletion (3.4s)
  ✓  21 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /old (5.6s)
  ✓  22 tests/e2e/public-pages.spec.ts:44:9 › public landing and information page loads: /skoleni (7.3s)
  ✓  23 tests/e2e/public-submissions.spec.ts:7:5 › submits the shared footer newsletter form (18.6s)
  ✓  24 tests/e2e/public-submissions.spec.ts:21:5 › submits the reusable get-started lead dialog (8.8s)
  ✓  25 tests/e2e/public-submissions.spec.ts:35:5 › submits the business lead dialog (11.0s)
  ✓  26 tests/e2e/public-submissions.spec.ts:49:5 › submits the homepage qualification lead flow (13.6s)
  ✓  27 tests/e2e/public-submissions.spec.ts:74:5 › submits Pavol’s personal contact form (27.4s)
  ✓  28 tests/e2e/public-submissions.spec.ts:90:5 › submits a published online-workshop registration (12.8s)
  ✓  29 tests/e2e/public-submissions.spec.ts:110:5 › personalizes and submits the 199 Kč Promptbook paid community membership (5.0s)
  ✘  30 tests/e2e/public-submissions.spec.ts:137:5 › submits an available AI Supervize Mini workshop registration (45.6s)
  -  31 tests/e2e/public-submissions.spec.ts:165:5 › submits the AI Supervize Mini future-term interest form
  -  32 tests/e2e/public-submissions.spec.ts:184:5 › submits the AI ta Krajta collaboration form
  -  33 tests/e2e/public-submissions.spec.ts:199:5 › plays the newest AI ta Krajta episode from the header
  -  34 tests/e2e/public-submissions.spec.ts:208:5 › filters the AI ta Krajta archive by a person and keeps it in the address
  -  35 tests/e2e/public-submissions.spec.ts:219:5 › connects a public online-workshop participant
Saved 30 E2E video(s) to tests/e2e/videos/.


  1) tests/e2e/public-submissions.spec.ts:137:5 › submits an available AI Supervize Mini workshop registration

    Test timeout of 45000ms exceeded.

    Error: page.waitForResponse: Test timeout of 45000ms exceeded.

       at support/submissions.ts:19

      17 |     submit: () => Promise<void>,
      18 | ): Promise<void> {
    > 19 |     const responsePromise = page.waitForResponse(
         |                                  ^
      20 |         (response) =>
      21 |             response.request().method() === 'POST' && isMatchingApiPath(new URL(response.url()).pathname, apiPath),
      22 |     );
        at submitAndExpectApiSuccess (/Users/hejny/work/aldaron/tests/e2e/support/submissions.ts:19:34)
        at /Users/hejny/work/aldaron/tests/e2e/public-submissions.spec.ts:158:36

    Error: ENOSPC: no space left on device, write

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/public-submissions-submits-bbb4c--Mini-workshop-registration/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/public-submissions-submits-bbb4c--Mini-workshop-registration/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/public-submissions-submits-bbb4c--Mini-workshop-registration/error-context.md

  1 failed
    tests/e2e/public-submissions.spec.ts:137:5 › submits an available AI Supervize Mini workshop registration
  5 did not run
  29 passed (4.3m)
[1]-  Exit 1                  bash "$1"
```

- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](CHANGELOG.md)
- Update the [README](README.md) if needed.
- Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.
