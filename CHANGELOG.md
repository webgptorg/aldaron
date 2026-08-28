# Changelog

## Unreleased

- Gave every E2E test the same cold-compilation budget from one place in the Playwright configuration, so a public
  form which happens to be the first to reach its endpoint is no longer reported as broken merely for having waited
  for the development server to compile it.
- Let every public-submission test run even when one of them fails, so a single slow form no longer hides whether the
  remaining public forms still accept a submission.
- Bounded the archive of E2E recordings to the most recent runs, so repeated verification cannot fill the disk of the
  machine which is verifying the project.
- Kept every public-page smoke assertion while isolating each route, so cold Next.js compilation cannot time out a
  healthy route reached later in the suite.
- Allowed the local Playwright loopback host to load Next.js development resources without cross-origin blocking.
- Made type verification regenerate Next.js route types before running TypeScript, preventing removed routes left in `.next/types` from breaking subsequent coding runs.
- Fixed the thank-you page's internal homepage navigation so the production lint check passes.
- Made local Playwright verification self-contained when a Supabase service-role key is unavailable, while retaining configured-database coverage when one is provided.
