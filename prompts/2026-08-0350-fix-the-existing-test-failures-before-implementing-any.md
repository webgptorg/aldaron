[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.6093 26 minutes; Testing 4 minutes

[✨🦿] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
> promptbook-landing-page@0.1.0 test-for-ptbk-coder
> npm run lint && npm run test-types && npx kill-port 4009 && next build && npm run test-e2e


> promptbook-landing-page@0.1.0 lint
> next lint


./app/admin/contacts/useContactsViewState.ts
41:9  Warning: React Hook useCallback has a missing dependency: 'setViewState'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
70:9  Warning: React Hook useCallback has a missing dependency: 'setViewState'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/admin/contacts/useDebouncedContactSaver.ts
32:31  Warning: The ref value 'pendingChangesRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'pendingChangesRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps

./app/dekujeme/page.tsx
104:37  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
133:37  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
162:21  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
162:21  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages

./components/footer.test.tsx
55:62  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
55:62  Warning: img elements must have an alt prop, either with meaningful text, or an empty string for decorative images.  jsx-a11y/alt-text

./components/try-it-yourself-section.tsx
44:17  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

