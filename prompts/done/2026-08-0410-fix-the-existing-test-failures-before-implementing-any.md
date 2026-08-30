[x] by OpenAI Codex `gpt-5.6-sol` thinking `max` (ChatGPT account) - Implementation ~$0.1707 9 minutes; Testing 4 minutes

[✨📟] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
> promptbook-landing-page@0.1.0 test-for-ptbk-coder
> npm run lint && npm run test-types && npx kill-port 4009 && next build && npm run test-e2e


> promptbook-landing-page@0.1.0 lint
> next lint

✔ No ESLint warnings or errors

> promptbook-landing-page@0.1.0 test-types
> tsc

.next/types/app/api/community/membership/registration/route.ts(2,24): error TS2307: Cannot find module '../../../../../../../app/api/community/membership/registration/route.js' or its corresponding type declarations.
.next/types/app/api/community/membership/registration/route.ts(5,29): error TS2307: Cannot find module '../../../../../../../app/api/community/membership/registration/route.js' or its corresponding type declarations.
.next/types/app/cs/komunita/clenstvi/page.ts(2,24): error TS2307: Cannot find module '../../../../../../app/cs/komunita/clenstvi/page.js' or its corresponding type declarations.
.next/types/app/cs/komunita/clenstvi/page.ts(5,29): error TS2307: Cannot find module '../../../../../../app/cs/komunita/clenstvi/page.js' or its corresponding type declarations.
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

