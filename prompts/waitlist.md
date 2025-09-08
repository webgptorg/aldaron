[x]

Add waitlist functionality

The functionality of this page should be locked up behind a waitlist.

-   When locked, instead of the redirection to `promptbook.studio/from-*` pages, show a waitlist popup
-   Put this functionality on each way how to get to the redirection, call to action buttons, header links, footer links,...
-   The waitlist popup should have a form with email input and submit button
-   It should be saved to Supabase table `WaitlistContact` with columns `id`, `createdAt`, `email` and other measuring columns like `userAgent`, `ipAddress`, `referrer` if possible,...
-   By functionality I mean the redirection to `promptbook.studio/from-*` pages
-   Add GET search param `?skipWaitlist=<NEXT_PUBLIC_SKIP_WAITLIST_TOKEN>` to skip waitlist
-   When `skipWaitlist` is present, the behavior is the same as now
-   Add `NEXT_PUBLIC_SKIP_WAITLIST_TOKEN` env variable to the configuration, do not validate against the server API, just check if the value is present and matches

Theese environment variables are configured in `.env`:

-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `SUPABASE_SERVICE_ROLE_KEY`
