# Changelog

## Unreleased

- Made type verification regenerate Next.js route types before running TypeScript, preventing removed routes left in `.next/types` from breaking subsequent coding runs.
- Fixed the thank-you page's internal homepage navigation so the production lint check passes.
- Made local Playwright verification self-contained when a Supabase service-role key is unavailable, while retaining configured-database coverage when one is provided.
