[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2195 15 minutes; Testing 6 minutes

[✨❓] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
[..., test output truncated to the last 12000 characters...]
             342 B         102 kB
├ ƒ /api/track-click                                                                        342 B         102 kB
├ ƒ /api/waitlist                                                                           342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                  342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                      342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                              342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                   342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                  342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                               342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                              342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                      342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                  342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                 342 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                     342 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                        342 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                    342 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       342 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                342 B         102 kB
├ ○ /branding                                                                             4.81 kB         141 kB
├ ○ /contact                                                                              2.53 kB         164 kB
├ ○ /cs                                                                                     172 B         240 kB
├ ƒ /cs/komunita                                                                            222 B         266 kB
├ ƒ /cs/komunita/clenstvi                                                                 16.4 kB         152 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   342 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            342 B         102 kB
├ ƒ /cs/komunita/projects                                                                 1.96 kB         137 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     8.26 kB         252 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   21.2 kB         240 kB
├ ƒ /cs/online-workshop/dekujeme                                                          3.85 kB         151 kB
├ ○ /cs/online-workshop/opengraph-image                                                     342 B         102 kB
├ ƒ /cs/online-workshop/participant                                                        5.3 kB         249 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         342 B         102 kB
├ ○ /cs/opengraph-image                                                                     342 B         102 kB
├ ○ /cs/pavol                                                                               159 B         202 kB
├ ○ /cs/pavol/opengraph-image                                                               342 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             3.74 kB         151 kB
├ ○ /en                                                                                     172 B         240 kB
├ ○ /en/opengraph-image                                                                     342 B         102 kB
├ ○ /en/pavol                                                                               159 B         202 kB
├ ○ /en/pavol/opengraph-image                                                               342 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.51 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               342 B         102 kB
├ ○ /for-industry                                                                         8.05 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           342 B         102 kB
├ ○ /hackathon-factory                                                                    15.3 kB         253 kB
├ ○ /hackathon-factory/opengraph-image                                                      342 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               342 B         102 kB
├ ○ /manifest.webmanifest                                                                   342 B         102 kB
├ ○ /old                                                                                  17.9 kB         246 kB
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
  └ other shared chunks (total)                                                           2.53 kB


ƒ Middleware                                                                              30.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 12 tests using 1 worker

[WebServer]  ⚠ Blocked cross-origin request from 127.0.0.1 to /_next/* resource. To allow this, configure "allowedDevOrigins" in next.config
[WebServer] Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  ✘   1 tests\e2e\public-pages.spec.ts:28:5 › public landing and information pages load (3.6m)
  ✓   2 tests\e2e\public-submissions.spec.ts:7:5 › submits the shared footer newsletter form (45.0s)
  ✓   3 tests\e2e\public-submissions.spec.ts:21:5 › submits the reusable get-started lead dialog (25.7s)
  ✓   4 tests\e2e\public-submissions.spec.ts:35:5 › submits the business lead dialog (19.7s)
  ✓   5 tests\e2e\public-submissions.spec.ts:49:5 › submits the homepage qualification lead flow (33.0s)
  ✓   6 tests\e2e\public-submissions.spec.ts:74:5 › submits the AI Ta Krajta subscription form (12.4s)
  ✓   7 tests\e2e\public-submissions.spec.ts:88:5 › submits Pavol’s personal contact form (9.8s)
  ✓   8 tests\e2e\public-submissions.spec.ts:104:5 › submits a published online-workshop registration (25.4s)
  ✓   9 tests\e2e\public-submissions.spec.ts:124:5 › personalizes and submits a Promptbook community membership trial (21.1s)
  ✓  10 tests\e2e\public-submissions.spec.ts:150:5 › submits an available AI Supervize Mini workshop registration (9.4s)
  ✓  11 tests\e2e\public-submissions.spec.ts:178:5 › submits the AI Supervize Mini future-term interest form (4.1s)
  -  12 tests\e2e\public-submissions.spec.ts:197:5 › connects a public online-workshop participant
Saved 12 E2E video(s) to tests/e2e/videos/.


  1) tests\e2e\public-pages.spec.ts:28:5 › public landing and information pages load ───────────────

    Test timeout of 180000ms exceeded.

    Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
    Call log:
      - navigating to "http://127.0.0.1:4009/data-deletion", waiting until "domcontentloaded"


      33 |     for (const path of PUBLIC_PAGE_PATHS) {
      34 |         await test.step(path, async () => {
    > 35 |             const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
         |                                         ^
      36 |
      37 |             expect(response, `Expected ${path} to produce a document response`).not.toBeNull();
      38 |             expect(response!.ok(), `Expected ${path} to load without a server error`).toBeTruthy();
        at C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\public-pages.spec.ts:35:41
        at C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\public-pages.spec.ts:34:9

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests\e2e\.artifacts\public-pages-public-landing-and-information-pages-load\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests\e2e\.artifacts\public-pages-public-landing-and-information-pages-load\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests\e2e\.artifacts\public-pages-public-landing-and-information-pages-load\error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests\e2e\.artifacts\public-pages-public-landing-and-information-pages-load\trace.zip
    Usage:

        npx playwright show-trace tests\e2e\.artifacts\public-pages-public-landing-and-information-pages-load\trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tests\e2e\public-pages.spec.ts:28:5 › public landing and information pages load ────────────────
  1 skipped
  10 passed (8.2m)
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

