# Changelog

## Unreleased

- Checked every public redirect by the destination it names instead of by following it, so a redirecting address such
  as `/skoleni` now proves its own status code and destination rather than re-rendering an already covered page through
  the Next.js development server a second time.
- Added the Czech and English privacy-policy and terms pages to the public-page smoke suite, which previously reached
  only the language the test browser happened to ask for.
- Covered that `/skoleni` carries a discount code into the AI Supervize Mini registration anchor.
- Kept every public-page smoke assertion while isolating each route, so cold Next.js compilation cannot time out a
  healthy route reached later in the suite.
- Allowed the local Playwright loopback host to load Next.js development resources without cross-origin blocking.
- Made type verification regenerate Next.js route types before running TypeScript, preventing removed routes left in `.next/types` from breaking subsequent coding runs.
- Fixed the thank-you page's internal homepage navigation so the production lint check passes.
- Made local Playwright verification self-contained when a Supabase service-role key is unavailable, while retaining configured-database coverage when one is provided.
