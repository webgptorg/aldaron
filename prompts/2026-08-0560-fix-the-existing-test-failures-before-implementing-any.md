[x] by Claude Code `claude-opus-5` thinking `max` - Implementation $6.26 an hour; Testing 7 minutes

[✨𓀋] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
[..., test output truncated to the last 12000 characters...]
             4.81 kB         141 kB
├ ○ /contact                                                                              2.53 kB         164 kB
├ ○ /cs                                                                                     172 B         240 kB
├ ƒ /cs/komunita                                                                            231 B         266 kB
├ ƒ /cs/komunita/clenstvi                                                                 14.2 kB         150 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   341 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            341 B         102 kB
├ ƒ /cs/komunita/projects                                                                 1.96 kB         137 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     8.26 kB         252 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   10.5 kB         242 kB
├ ƒ /cs/online-workshop/dekujeme                                                          3.85 kB         151 kB
├ ○ /cs/online-workshop/opengraph-image                                                     341 B         102 kB
├ ƒ /cs/online-workshop/participant                                                        5.3 kB         249 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         341 B         102 kB
├ ○ /cs/opengraph-image                                                                     341 B         102 kB
├ ○ /cs/pavol                                                                               159 B         202 kB
├ ○ /cs/pavol/opengraph-image                                                               341 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             3.74 kB         151 kB
├ ○ /en                                                                                     172 B         240 kB
├ ○ /en/opengraph-image                                                                     341 B         102 kB
├ ○ /en/pavol                                                                               159 B         202 kB
├ ○ /en/pavol/opengraph-image                                                               341 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.51 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               341 B         102 kB
├ ○ /for-industry                                                                         8.05 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           341 B         102 kB
├ ○ /hackathon-factory                                                                    15.3 kB         253 kB
├ ○ /hackathon-factory/opengraph-image                                                      341 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               341 B         102 kB
├ ○ /manifest.webmanifest                                                                   341 B         102 kB
├ ○ /old                                                                                  17.9 kB         246 kB
├ ○ /opengraph-image                                                                        341 B         102 kB
├ ƒ /pavol                                                                                  341 B         102 kB
├ ƒ /privacy                                                                                341 B         102 kB
├ ƒ /pro-firmy                                                                              341 B         102 kB
├ ○ /pro-mesta                                                                            6.77 kB         268 kB
├ ○ /pro-mesta/opengraph-image                                                              341 B         102 kB
├ ○ /robots.txt                                                                             341 B         102 kB
├ ○ /shortener                                                                              341 B         102 kB
├ ○ /sitemap.xml                                                                            341 B         102 kB
├ ƒ /skoleni                                                                                341 B         102 kB
├ ƒ /terms                                                                                  341 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-6c8ee981b3c4cfc9.js                                                       45.8 kB
  ├ chunks/4bd1b696-56d776b9b579ad04.js                                                   53.3 kB
  └ other shared chunks (total)                                                           2.53 kB


ƒ Middleware                                                                              30.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 31 tests using 1 worker

  ✓   1 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: / (4.8s)
  ✓   2 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /cs (6.9s)
  ✓   3 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /en (3.4s)
  ✓   4 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /pro-mesta (5.0s)
  ✓   5 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /for-agro (4.6s)
  ✓   6 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /for-industry (5.0s)
  ✓   7 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /ai-supervize (4.2s)
  ✓   8 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /ai-supervize-mini (7.5s)
  ✓   9 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /hackathon-factory (4.2s)
  ✓  10 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /cs/online-workshop (4.8s)
  ✓  11 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /cs/komunita/clenstvi (3.7s)
  ✓  12 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /cs/pavol (5.6s)
  ✓  13 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /en/pavol (4.9s)
  ✓  14 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /pavol (5.7s)
  ✓  15 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /contact (5.0s)
  ✓  16 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /branding (6.7s)
  ✓  17 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /privacy (8.7s)
  ✓  18 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /terms (7.9s)
  ✓  19 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /data-deletion (3.4s)
  ✓  20 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /old (6.9s)
[WebServer]  ⨯ TypeError: Cannot read properties of undefined (reading 'call')
[WebServer]     at Object.__webpack_require__ [as require] (C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\.next\server\webpack-runtime.js:33:43) {
[WebServer]   digest: '1897056333'
[WebServer] }
  ✘  21 tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /skoleni (11.5s)
  ✓  22 tests\e2e\public-submissions.spec.ts:7:5 › submits the shared footer newsletter form (18.9s)
  ✓  23 tests\e2e\public-submissions.spec.ts:21:5 › submits the reusable get-started lead dialog (7.7s)
  ✓  24 tests\e2e\public-submissions.spec.ts:35:5 › submits the business lead dialog (6.3s)
  ✓  25 tests\e2e\public-submissions.spec.ts:49:5 › submits the homepage qualification lead flow (17.2s)
  ✓  26 tests\e2e\public-submissions.spec.ts:74:5 › submits Pavol’s personal contact form (7.6s)
  ✓  27 tests\e2e\public-submissions.spec.ts:90:5 › submits a published online-workshop registration (13.6s)
  ✓  28 tests\e2e\public-submissions.spec.ts:110:5 › personalizes and submits the 199 Kč Promptbook paid community membership (7.8s)
  ✓  29 tests\e2e\public-submissions.spec.ts:137:5 › submits an available AI Supervize Mini workshop registration (9.6s)
  ✓  30 tests\e2e\public-submissions.spec.ts:165:5 › submits the AI Supervize Mini future-term interest form (4.2s)
  -  31 tests\e2e\public-submissions.spec.ts:184:5 › connects a public online-workshop participant
Saved 31 E2E video(s) to tests/e2e/videos/.


  1) tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /skoleni ─────

    Error: Expected /skoleni to load without a server error

    expect(received).toBeTruthy()

    Received: false

      33 |
      34 |     expect(response, `Expected ${path} to produce a document response`).not.toBeNull();
    > 35 |     expect(response!.ok(), `Expected ${path} to load without a server error`).toBeTruthy();
         |                                                                               ^
      36 |     await expect(
      37 |         page.locator('main, h1, footer').first(),
      38 |         `Expected ${path} to render visible page content`,
        at expectPublicPageToLoad (C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\public-pages.spec.ts:35:79)
        at C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\public-pages.spec.ts:49:9

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests\e2e\.artifacts\public-pages-public-landin-8f2a1-ormation-page-loads-skoleni\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests\e2e\.artifacts\public-pages-public-landin-8f2a1-ormation-page-loads-skoleni\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests\e2e\.artifacts\public-pages-public-landin-8f2a1-ormation-page-loads-skoleni\error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests\e2e\.artifacts\public-pages-public-landin-8f2a1-ormation-page-loads-skoleni\trace.zip
    Usage:

        npx playwright show-trace tests\e2e\.artifacts\public-pages-public-landin-8f2a1-ormation-page-loads-skoleni\trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tests\e2e\public-pages.spec.ts:43:9 › public landing and information page loads: /skoleni ──────
  1 skipped
  29 passed (4.5m)
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

